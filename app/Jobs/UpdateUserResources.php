<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class UpdateUserResources implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;

    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    public function handle(PterodactylService $pterodactylService)
    {
        $startTime = microtime(true);
        
        $user = User::find($this->userId);
        if (!$user || !$user->pterodactyl_id) {
            Log::warning("UpdateUserResources job: User not found or no pterodactyl_id for user {$this->userId}");
            return;
        }

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

        try {
            $servers = $pterodactylService->getUserServers($user->pterodactyl_id);
            
            if (!empty($servers) && is_array($servers)) {
                foreach ($servers as $server) {
                    // Calculate limits
                    if (isset($server['attributes']['limits'])) {
                        $limits = $server['attributes']['limits'];
                        
                        // Safely add each limit, defaulting to 0 if not set
                        $totalResources['memory'] += isset($limits['memory']) ? (int)$limits['memory'] : 0;
                        $totalResources['swap']   += isset($limits['swap']) ? (int)$limits['swap'] : 0;
                        $totalResources['disk']   += isset($limits['disk']) ? (int)$limits['disk'] : 0;
                        $totalResources['io']     += isset($limits['io']) ? (int)$limits['io'] : 0;
                        $totalResources['cpu']    += isset($limits['cpu']) ? (int)$limits['cpu'] : 0;
                    }
                    
                    // Calculate feature limits
                    if (isset($server['attributes']['feature_limits'])) {
                        $featureLimits = $server['attributes']['feature_limits'];
                        
                        // Safely add each feature limit, defaulting to 0 if not set
                        $totalResources['databases'] += isset($featureLimits['databases']) ? (int)$featureLimits['databases'] : 0;
                        $totalResources['allocations'] += isset($featureLimits['allocations']) ? (int)$featureLimits['allocations'] : 0;
                        $totalResources['backups'] += isset($featureLimits['backups']) ? (int)$featureLimits['backups'] : 0;
                    }
                }
                
                $totalResources['servers'] = count($servers);
                
                // Check if resources have changed before updating
                $hasChanged = false;
                if (!$user->resources) {
                    $hasChanged = true;
                } else {
                    foreach ($totalResources as $key => $value) {
                        if (!isset($user->resources[$key]) || $user->resources[$key] != $value) {
                            $hasChanged = true;
                            break;
                        }
                    }
                }
                
                if ($hasChanged) {
                    // Update user's resources in database
                    $user->resources = $totalResources;
                    $user->save();
                    
                    Log::info("Updated resources for user {$user->id}", [
                        'resources' => $totalResources
                    ]);
                } else {
                    Log::info("No resource changes for user {$user->id}");
                }
                
                // Always update the cache with the latest data
                Cache::put('user_resources_' . $user->id, [
                    'totalResources' => $totalResources,
                    'serverCount' => count($servers),
                    'lastUpdated' => now()->toDateTimeString()
                ], 300);
            } else {
                // No servers found
                Log::info("No servers found for user {$user->id} with pterodactyl_id {$user->pterodactyl_id}");
                
                $totalResources['servers'] = 0;
                
                // Update user model with zero resources
                $user->resources = $totalResources;
                $user->save();
                
                // Update cache
                Cache::put('user_resources_' . $user->id, [
                    'totalResources' => $totalResources,
                    'serverCount' => 0,
                    'lastUpdated' => now()->toDateTimeString()
                ], 300);
            }
            
            $endTime = microtime(true);
            $executionTime = round(($endTime - $startTime) * 1000, 2);
            
            Log::info("UpdateUserResources job completed in {$executionTime}ms for user {$user->id}");
            
        } catch (\Exception $e) {
            Log::error('Failed to update resources in job: ' . $e->getMessage(), [
                'userId' => $this->userId,
                'trace' => $e->getTraceAsString()
            ]);
            
            // Even in case of error, we should cache what we have to prevent repeated failures
            Cache::put('user_resources_' . $user->id, [
                'totalResources' => $user->resources ?: $totalResources,
                'serverCount' => $user->resources['servers'] ?? 0,
                'lastUpdated' => now()->toDateTimeString(),
                'error' => $e->getMessage()
            ], 300);
        }
    }
}