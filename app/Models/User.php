<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Casts\AsCollection;
use App\Jobs\UpdateUserResources;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'discord_id', 'pterodactyl_id', 'pterodactyl_email',
        'limits', 'resources', 'rank', 'coins', 'purchases_plans'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'limits' => 'array',
        'resources' => 'array',
        'purchases_plans' => 'array',
    ];

    // Add this method to initialize default values when a user is created
    protected static function booted()
    {
        // After a user is retrieved, schedule a background job to update resources
        static::retrieved(function ($user) {
            // Only proceed for users with a pterodactyl ID
            if ($user->pterodactyl_id) {
                // Check if resources need updating (older than 15 minutes)
                $lastUpdated = Cache::get('last_resource_update_' . $user->id);
                $needsUpdate = !$lastUpdated || now()->diffInMinutes($lastUpdated) > 15;
                
                if ($needsUpdate) {
                    // Use a lock to prevent multiple jobs for the same user
                    $lockKey = 'resource_sync_lock_' . $user->id;
                    
                    if (!Cache::has($lockKey)) {
                        // Set lock for 5 minutes to prevent job spam
                        Cache::put($lockKey, true, 300);
                        
                        // High priority for users actively using the site
                        $queue = request()->hasHeader('X-Requested-With') ? 'high' : 'low';
                        
                        UpdateUserResources::dispatch($user->id)
                            ->onQueue($queue);
                        
                        Log::info("Dispatched resource update job for user {$user->id} on {$queue} queue");
                    }
                }
            }
            
            // Continue with existing logic for setting default values
            $dirty = false;

            if ($user->limits === null) {
                $user->limits = [
                    'cpu' => (int) env('INITIAL_CPU', 750),
                    'memory' => (int) env('INITIAL_MEMORY', 1500),
                    'disk' => (int) env('INITIAL_DISK', 3024),
                    'servers' => (int) env('INITIAL_SERVERS', 1),
                    'databases' => (int) env('INITIAL_DATABASES', 0),
                    'backups' => (int) env('INITIAL_BACKUPS', 0),
                    'allocations' => (int) env('INITIAL_ALLOCATIONS', 2),
                ];
                $dirty = true;
            }

            if ($user->resources === null) {
                $user->resources = [
                    'cpu' => 0,
                    'memory' => 0,
                    'disk' => 0,
                    'databases' => 0,
                    'allocations' => 0,
                    'backups' => 0,
                    'servers' => 0,
                ];
                $dirty = true;
            }

            if ($user->purchases_plans === null) {
                $user->purchases_plans = [];
                $dirty = true;
            }

            if ($user->rank === null) {
                $user->rank = 'free';
                $dirty = true;
            }

            if ($user->coins === null) {
                $user->coins = 0;
                $dirty = true;
            }

            if ($dirty) {
                $user->save();
            }
        });
        
        // [Your existing creating callback stays the same]
    }

    /**
     * Check if the user has enough allocation slots available
     *
     * @param int $required Number of allocation slots required
     * @return bool
     */
    public function hasEnoughAllocations(int $required): bool
    {
        // Ensure we have the latest data for critical operations
        $this->ensureResourcesUpToDate();
        
        // Make sure resources and limits are properly initialized
        if (!isset($this->limits['allocations']) || !isset($this->resources['allocations'])) {
            return false;
        }
        
        $available = $this->limits['allocations'] - $this->resources['allocations'];
        return $available >= $required;
    }
    
    /**
     * Ensure we have up-to-date resources for critical operations
     * Will do a quick check and sync if necessary
     */
    protected function ensureResourcesUpToDate(): void
    {
        // Only proceed for critical operations and if we have a pterodactyl ID
        if (!$this->pterodactyl_id || !$this->isCriticalOperation()) {
            return;
        }
        
        // Check if resources are stale (older than 2 minutes for critical operations)
        $lastUpdated = Cache::get('last_resource_update_' . $this->id);
        if (!$lastUpdated || now()->diffInMinutes($lastUpdated) > 2) {
            $this->syncResources(true); // Synchronous update for critical operations
        }
    }
    
    /**
     * Determine if the current request is for a critical operation
     * that requires up-to-date resource information
     */
    protected function isCriticalOperation(): bool
    {
        $criticalPaths = [
            'servers/create',
            'servers/*/settings',
            'deploy', 
            'admin/servers'
        ];
        
        foreach ($criticalPaths as $path) {
            if (request()->is($path)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Manually sync resources for this user
     * 
     * @param bool $wait Whether to wait for the job to complete
     * @return void
     */
    public function syncResources(bool $wait = false): void
    {
        if (!$this->pterodactyl_id) {
            Log::warning("Cannot sync resources: No pterodactyl_id for user {$this->id}");
            return;
        }
        
        // Skip if there's an active sync in progress
        $lockKey = 'resource_sync_lock_' . $this->id;
        if (!$wait && Cache::has($lockKey)) {
            Log::info("Skipping resource sync - already in progress for user {$this->id}");
            return;
        }
        
        Log::info("Manually syncing resources for user {$this->id}" . ($wait ? ' (synchronous)' : ''));
        
        try {
            if ($wait) {
                // Set lock to prevent duplicate jobs
                Cache::put($lockKey, true, 300);
                
                // For immediate synchronization, dispatch and wait
                UpdateUserResources::dispatchSync($this->id);
                
                // Update last sync time
                Cache::put('last_resource_update_' . $this->id, now(), 3600);
            } else {
                // For background synchronization with high priority
                UpdateUserResources::dispatch($this->id)->onQueue('high');
            }
        } catch (\Exception $e) {
            Log::error("Resource sync failed: " . $e->getMessage());
        } finally {
            // If synchronous, release the lock
            if ($wait) {
                Cache::forget($lockKey);
            }
        }
    }
    
    /**
     * Static method to sync resources for a user by ID
     * 
     * @param int $userId The user ID
     * @param bool $wait Whether to wait for the job to complete
     * @return bool Success or failure
     */
    public static function syncResourcesById(int $userId, bool $wait = false): bool
    {
        $user = self::find($userId);
        
        if (!$user) {
            Log::error("User not found for resource sync: {$userId}");
            return false;
        }
        
        $user->syncResources($wait);
        return true;
    }
    
    /**
     * Add a refresh button to any view
     * 
     * @return string HTML for refresh button
     */
    public function getRefreshButtonHtml(): string
    {
        $url = request()->fullUrlWithQuery(['refresh_resources' => '1']);
        return '<a href="' . $url . '" class="btn btn-sm btn-outline-secondary">' .
               '<i class="fas fa-sync-alt"></i> Refresh Resources</a>';
    }
}