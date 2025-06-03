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
use GuzzleHttp\Promise;
use GuzzleHttp\Client;

class UpdateUserResources implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;
    
    // Settings to prevent infinite retries
    public $tries = 3;
    public $backoff = 10;
    public $timeout = 120; // Increase timeout for concurrent operations

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
            // Get all servers for the user
            $servers = $pterodactylService->getUserServers($user->pterodactyl_id);
            
            if (!empty($servers) && is_array($servers)) {
                // Process normalization issue servers in parallel
                $normalizedServerIds = [];
                
                foreach ($servers as $server) {
                    if (isset($server['attributes']['limits']) && 
                        (is_string($server['attributes']['limits']['memory'] ?? null) && 
                         strpos($server['attributes']['limits']['memory'] ?? '', 'Over 9 levels deep') !== false)) {
                        
                        $serverId = $server['attributes']['id'] ?? null;
                        if ($serverId) {
                            $normalizedServerIds[] = $serverId;
                        }
                    }
                }
                
                // If we have servers with normalization issues, fetch them concurrently
                if (!empty($normalizedServerIds)) {
                    $normalizedServers = $this->fetchServersInParallel($pterodactylService, $normalizedServerIds);
                }
                
                // Process each server
                foreach ($servers as $server) {
                    // Skip invalid data
                    if (!isset($server['attributes'])) {
                        continue;
                    }
                    
                    // Handle normalization issue
                    if (isset($server['attributes']['limits']) && 
                        (is_string($server['attributes']['limits']['memory'] ?? null) && 
                         strpos($server['attributes']['limits']['memory'] ?? '', 'Over 9 levels deep') !== false)) {
                        
                        $serverId = $server['attributes']['id'] ?? null;
                        
                        // Use the server details we fetched in parallel
                        if ($serverId && isset($normalizedServers[$serverId])) {
                            $serverDetails = $normalizedServers[$serverId];
                            
                            if (isset($serverDetails['attributes']['limits'])) {
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
                        } else {
                            // Fallback to defaults
                            $totalResources['memory'] += 1024;
                            $totalResources['disk'] += 10000;
                            $totalResources['cpu'] += 100;
                            $totalResources['allocations'] += 1;
                        }
                        
                        continue;
                    }
                    
                    // Regular processing for correctly formatted servers
                    // [existing processing code stays the same]
                }
                
                $totalResources['servers'] = count($servers);
                
                // Update the user's resources in database
                $user->resources = $totalResources;
                $user->save();
                
                Log::info("Updated resources for user {$user->id}", [
                    'resources' => $totalResources
                ]);
            } else {
                // No servers found - reset resources to zero
                // [existing zero-resources code stays the same]
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
    
    /**
     * Fetch multiple servers in parallel to improve performance
     *
     * @param PterodactylService $service
     * @param array $serverIds
     * @return array
     */
    private function fetchServersInParallel(PterodactylService $service, array $serverIds): array
    {
        $results = [];
        
        try {
            // Get the HTTP client from the service (assuming it has one)
            $client = $service->getClient();
            
            // If not, create a new client
            if (!$client) {
                $client = new Client([
                    'base_uri' => config('pterodactyl.base_uri'),
                    'headers' => [
                        'Authorization' => 'Bearer ' . config('pterodactyl.api_key'),
                        'Accept' => 'application/json',
                        'Content-Type' => 'application/json',
                    ],
                ]);
            }
            
            // Create promises for each server
            $promises = [];
            foreach ($serverIds as $serverId) {
                $promises[$serverId] = $client->getAsync("/api/application/servers/{$serverId}");
            }
            
            // Wait for all promises to complete
            $responses = Promise\Utils::settle($promises)->wait();
            
            // Process the responses
            foreach ($responses as $serverId => $response) {
                if ($response['state'] === 'fulfilled') {
                    $body = $response['value']->getBody();
                    $data = json_decode($body, true);
                    $results[$serverId] = $data;
                } else {
                    Log::error("Failed to fetch server {$serverId}: " . $response['reason']);
                }
            }
        } catch (\Exception $e) {
            Log::error("Error in parallel fetch: " . $e->getMessage());
        }
        
        return $results;
    }
}