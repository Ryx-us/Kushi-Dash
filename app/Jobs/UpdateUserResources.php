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

class UpdateUserResources implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;
    
    // Settings to prevent infinite retries
    public $tries = 3;
    public $backoff = 10;

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
                    // Check if we have valid data format
                    if (!isset($server['attributes'])) {
                        Log::warning("Invalid server data format for user {$user->id}", [
                            'server' => $server
                        ]);
                        continue;
                    }
                    
                    // Handle normalization issue
                    if (isset($server['attributes']['limits']) && 
                        (is_string($server['attributes']['limits']['memory'] ?? null) && 
                         strpos($server['attributes']['limits']['memory'] ?? '', 'Over 9 levels deep') !== false)) {
                        
                        Log::warning("Detected normalization issue in API response for user {$user->id}");
                        
                        // Get server details individually with correct depth
                        try {
                            $serverId = $server['attributes']['id'] ?? null;
                            if ($serverId) {
                                $serverDetails = $pterodactylService->getServerById($serverId);
                                if ($serverDetails && isset($serverDetails['attributes']['limits'])) {
                                    // Use these details instead
                                    $limits = $serverDetails['attributes']['limits'];
                                    $featureLimits = $serverDetails['attributes']['feature_limits'] ?? [];
                                    
                                    // Process the correct limits
                                    $totalResources['memory'] += is_numeric($limits['memory'] ?? null) ? (int)$limits['memory'] : 0;
                                    $totalResources['swap'] += is_numeric($limits['swap'] ?? null) ? (int)$limits['swap'] : 0;
                                    $totalResources['disk'] += is_numeric($limits['disk'] ?? null) ? (int)$limits['disk'] : 0;
                                    $totalResources['io'] += is_numeric($limits['io'] ?? null) ? (int)$limits['io'] : 0;
                                    $totalResources['cpu'] += is_numeric($limits['cpu'] ?? null) ? (int)$limits['cpu'] : 0;
                                    
                                    // Process feature limits
                                    $totalResources['databases'] += is_numeric($featureLimits['databases'] ?? null) ? (int)$featureLimits['databases'] : 0;
                                    $totalResources['allocations'] += is_numeric($featureLimits['allocations'] ?? null) ? (int)$featureLimits['allocations'] : 0;
                                    $totalResources['backups'] += is_numeric($featureLimits['backups'] ?? null) ? (int)$featureLimits['backups'] : 0;
                                }
                            }
                        } catch (\Exception $e) {
                            Log::error("Failed to get individual server details: " . $e->getMessage());
                            // Default fallback values - estimate based on your system's defaults
                            $totalResources['memory'] += 1024; // 1GB default
                            $totalResources['disk'] += 10000;  // 10GB default
                            $totalResources['cpu'] += 100;     // 100% default
                            $totalResources['allocations'] += 1; // 1 allocation default
                        }
                        
                        continue; // Skip regular processing for this server
                    }
                    
                    // Regular processing for correctly formatted servers
                    if (isset($server['attributes']['limits'])) {
                        $limits = $server['attributes']['limits'];
                        
                        // Safely add each limit, defaulting to 0 if not set or not numeric
                        $totalResources['memory'] += is_numeric($limits['memory'] ?? null) ? (int)$limits['memory'] : 0;
                        $totalResources['swap'] += is_numeric($limits['swap'] ?? null) ? (int)$limits['swap'] : 0;
                        $totalResources['disk'] += is_numeric($limits['disk'] ?? null) ? (int)$limits['disk'] : 0;
                        $totalResources['io'] += is_numeric($limits['io'] ?? null) ? (int)$limits['io'] : 0;
                        $totalResources['cpu'] += is_numeric($limits['cpu'] ?? null) ? (int)$limits['cpu'] : 0;
                    }
                    
                    // Calculate feature limits
                    if (isset($server['attributes']['feature_limits'])) {
                        $featureLimits = $server['attributes']['feature_limits'];
                        
                        // Safely add each feature limit, defaulting to 0 if not set or not numeric
                        $totalResources['databases'] += is_numeric($featureLimits['databases'] ?? null) ? (int)$featureLimits['databases'] : 0;
                        $totalResources['allocations'] += is_numeric($featureLimits['allocations'] ?? null) ? (int)$featureLimits['allocations'] : 0;
                        $totalResources['backups'] += is_numeric($featureLimits['backups'] ?? null) ? (int)$featureLimits['backups'] : 0;
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
            } else {
                // No servers found
                Log::info("No servers found for user {$user->id} with pterodactyl_id {$user->pterodactyl_id}");
                
                $totalResources['servers'] = 0;
                
                // Update user model with zero resources
                $user->resources = $totalResources;
                $user->save();
            }
            
            $endTime = microtime(true);
            $executionTime = round(($endTime - $startTime) * 1000, 2);
            
            Log::info("UpdateUserResources job completed in {$executionTime}ms for user {$user->id}");
            
        } catch (\Exception $e) {
            Log::error('Failed to update resources in job: ' . $e->getMessage(), [
                'userId' => $this->userId,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}