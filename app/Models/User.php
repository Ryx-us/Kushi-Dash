<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Casts\AsCollection;
use App\Jobs\UpdateUserResources;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;

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

    /**
     * Initialize default values for new users
     */
    protected static function booted()
    {
        // Initialize defaults when creating a user
        static::creating(function ($user) {
            if (!$user->limits) {
                $user->limits = [
                    'cpu' => (int) env('INITIAL_CPU', 750),
                    'memory' => (int) env('INITIAL_MEMORY', 1500),
                    'disk' => (int) env('INITIAL_DISK', 3024),
                    'servers' => (int) env('INITIAL_SERVERS', 1),
                    'databases' => (int) env('INITIAL_DATABASES', 0),
                    'backups' => (int) env('INITIAL_BACKUPS', 0),
                    'allocations' => (int) env('INITIAL_ALLOCATIONS', 2),
                ];
            }

            if (!$user->resources) {
                $user->resources = [
                    'cpu' => 0,
                    'memory' => 0,
                    'disk' => 0,
                    'databases' => 0,
                    'allocations' => 0,
                    'backups' => 0,
                    'servers' => 0,
                ];
            }

            if (!$user->purchases_plans) {
                $user->purchases_plans = [];
            }

            if (!$user->rank) {
                $user->rank = 'free';
            }

            if (!$user->coins) {
                $user->coins = 0;
            }
        });
        
        // Make sure defaults exist when retrieving a user
        static::retrieved(function ($user) {
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
            
            // Always update resources when model is accessed
            if ($user->pterodactyl_id) {
                $user->refreshResources();
            }
        });
    }
    
    /**
     * Check if the user has enough allocation slots available
     *
     * @param int $required Number of allocation slots required
     * @return bool
     */
    public function hasEnoughAllocations(int $required): bool
    {
        // Always refresh resources before checking
        $this->refreshResources();
        
        // Make sure resources and limits are properly initialized
        if (!isset($this->limits['allocations']) || !isset($this->resources['allocations'])) {
            return false;
        }
        
        $available = $this->limits['allocations'] - $this->resources['allocations'];
        return $available >= $required;
    }
    
    /**
     * Refresh user resources directly from Pterodactyl
     * No caching involved, always gets fresh data
     *
     * @return array The updated resources
     */
    public function refreshResources(): array
    {
        if (!$this->pterodactyl_id) {
            Log::warning("Cannot refresh resources: No pterodactyl_id for user {$this->id}");
            return $this->resources ?: [];
        }
        
        try {
            // Get the Pterodactyl service
            $pterodactylService = app(PterodactylService::class);
            
            // Initialize resource arrays
            $totalResources = [
                'memory' => 0, 
                'swap' => 0, 
                'disk' => 0, 
                'io' => 0, 
                'cpu' => 0,
                'databases' => 0, 
                'allocations' => 0, 
                'backups' => 0, 
                'servers' => 0
            ];
            
            // Get all servers for the user
            $servers = $pterodactylService->getUserServers($this->pterodactyl_id);
            
            if (!empty($servers) && is_array($servers)) {
                foreach ($servers as $server) {
                    // Skip invalid data
                    if (!isset($server['attributes'])) {
                        continue;
                    }
                    
                    // Handle normalization issue
                    if (isset($server['attributes']['limits']) && 
                        (is_string($server['attributes']['limits']['memory'] ?? null) && 
                         strpos($server['attributes']['limits']['memory'] ?? '', 'Over 9 levels deep') !== false)) {
                        
                        // Get detailed server data
                        $serverId = $server['attributes']['id'] ?? null;
                        if ($serverId) {
                            $serverDetails = $pterodactylService->getServerById($serverId);
                            if ($serverDetails && isset($serverDetails['attributes']['limits'])) {
                                // Process limits and feature limits
                                $limits = $serverDetails['attributes']['limits'];
                                $featureLimits = $serverDetails['attributes']['feature_limits'] ?? [];
                                
                                $totalResources['memory'] += is_numeric($limits['memory'] ?? null) ? (int)$limits['memory'] : 0;
                                $totalResources['swap'] += is_numeric($limits['swap'] ?? null) ? (int)$limits['swap'] : 0;
                                $totalResources['disk'] += is_numeric($limits['disk'] ?? null) ? (int)$limits['disk'] : 0;
                                $totalResources['io'] += is_numeric($limits['io'] ?? null) ? (int)$limits['io'] : 0;
                                $totalResources['cpu'] += is_numeric($limits['cpu'] ?? null) ? (int)$limits['cpu'] : 0;
                                
                                $totalResources['databases'] += is_numeric($featureLimits['databases'] ?? null) ? (int)$featureLimits['databases'] : 0;
                                $totalResources['allocations'] += is_numeric($featureLimits['allocations'] ?? null) ? (int)$featureLimits['allocations'] : 0;
                                $totalResources['backups'] += is_numeric($featureLimits['backups'] ?? null) ? (int)$featureLimits['backups'] : 0;
                            } else {
                                // Use defaults if we can't get details
                                $totalResources['memory'] += 1024;
                                $totalResources['disk'] += 10000;
                                $totalResources['cpu'] += 100;
                                $totalResources['allocations'] += 1;
                            }
                        }
                        
                        continue;
                    }
                    
                    // Regular processing for correctly formatted servers
                    if (isset($server['attributes']['limits'])) {
                        $limits = $server['attributes']['limits'];
                        
                        $totalResources['memory'] += is_numeric($limits['memory'] ?? null) ? (int)$limits['memory'] : 0;
                        $totalResources['swap'] += is_numeric($limits['swap'] ?? null) ? (int)$limits['swap'] : 0;
                        $totalResources['disk'] += is_numeric($limits['disk'] ?? null) ? (int)$limits['disk'] : 0;
                        $totalResources['io'] += is_numeric($limits['io'] ?? null) ? (int)$limits['io'] : 0;
                        $totalResources['cpu'] += is_numeric($limits['cpu'] ?? null) ? (int)$limits['cpu'] : 0;
                    }
                    
                    // Process feature limits
                    if (isset($server['attributes']['feature_limits'])) {
                        $featureLimits = $server['attributes']['feature_limits'];
                        
                        $totalResources['databases'] += is_numeric($featureLimits['databases'] ?? null) ? (int)$featureLimits['databases'] : 0;
                        $totalResources['allocations'] += is_numeric($featureLimits['allocations'] ?? null) ? (int)$featureLimits['allocations'] : 0;
                        $totalResources['backups'] += is_numeric($featureLimits['backups'] ?? null) ? (int)$featureLimits['backups'] : 0;
                    }
                }
                
                $totalResources['servers'] = count($servers);
            } else {
                // No servers found
                Log::info("No servers found for user {$this->id}");
                $totalResources['servers'] = 0;
            }
            
            // Always update resources in the database
            $this->resources = $totalResources;
            $this->save();
            
            Log::info("Updated resources for user {$this->id}", [
                'resources' => $totalResources
            ]);
            
            return $totalResources;
            
        } catch (\Exception $e) {
            Log::error("Failed to refresh resources: " . $e->getMessage(), [
                'userId' => $this->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return current resources in case of error
            return $this->resources ?: [];
        }
    }
    
    /**
     * Get available resources (calculated on the fly)
     *
     * @return array
     */
    public function getAvailableResources(): array
    {
        // Always refresh before calculating
        $this->refreshResources();
        
        $available = [];
        
        foreach ($this->limits as $key => $limit) {
            $used = $this->resources[$key] ?? 0;
            $available[$key] = $limit - $used;
        }
        
        return $available;
    }
    
    /**
     * Refresh resources for a user by ID (static helper)
     *
     * @param int $userId
     * @return bool
     */
    public static function refreshResourcesById(int $userId): bool
    {
        $user = self::find($userId);
        
        if (!$user) {
            Log::error("User not found for resource refresh: {$userId}");
            return false;
        }
        
        $user->refreshResources();
        return true;
    }
    
    /**
     * Get a refresh button for views
     *
     * @return string
     */
    public function getRefreshButtonHtml(): string
    {
        $url = request()->fullUrlWithQuery(['refresh' => time()]);
        return '<a href="' . $url . '" class="inline-flex items-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 shadow-sm text-sm leading-4 font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500">' .
               '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>' .
               'Refresh Resources</a>';
    }
}