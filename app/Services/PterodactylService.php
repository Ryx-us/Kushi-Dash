<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Promise\Utils;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class PterodactylService
{
    protected $apiUrl;
    protected $apiKey;
    protected $client;

    public function __construct()
    {
        $this->apiUrl = env('PTERODACTYL_API_URL');
        $this->apiKey = env('PTERODACTYL_API_KEY');
        $this->client = new Client([
            'base_uri' => $this->apiUrl,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ]
        ]);
    }

    public function createServer(
        string $name,
        int $userId,
        int $eggId,
        string $dockerImage,
        array $environment,
        array $limits,
        array $featureLimits,
        int $allocation,
        ?string $startup = null
    ) {
        try {
            $payload = [
                'name' => $name,
                'user' => $userId,
                'egg' => $eggId,
                'docker_image' => $dockerImage,
                'startup' => $startup,
                'environment' => $environment,
                'limits' => [
                    'memory' => $limits['memory'] ?? 128,
                    'swap' => $limits['swap'] ?? 0,
                    'disk' => $limits['disk'] ?? 512,
                    'io' => $limits['io'] ?? 500,
                    'cpu' => $limits['cpu'] ?? 100
                ],
                'feature_limits' => [
                    'databases' => $featureLimits['databases'] ?? 0,
                    'backups' => $featureLimits['backups'] ?? 0
                ],
                'allocation' => [
                    'default' => $allocation
                ]
            ];
    
            $response = $this->client->postAsync('/api/application/servers', [
                'json' => $payload
            ])->wait();
    
            if ($response->getStatusCode() !== 201) {
                Log::error('Failed to create server: ' . $response->getBody());
                throw new \Exception('Failed to create server: ' . $response->getBody());
            }
    
            return json_decode($response->getBody(), true);
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            if ($e->getResponse()->getStatusCode() === 404) {
                return null;
            }
            throw $e;
        }
    }

    public function getRandomUnassignedAllocation($nodeId)
{
    try {
        Log::info("Fetching allocations for node ID: " . $nodeId);
        $response = $this->client->getAsync("/api/application/nodes/{$nodeId}/allocations?include=servers&per_page=10000000000000000000000000000000000000000000000000000000000000000000000000")->wait();

        if ($response->getStatusCode() === 404) {
            Log::warning("Node not found: " . $nodeId);
            return null;
        }

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to fetch node allocations: ' . $response->getBody());
            throw new \Exception('Failed to fetch node allocations: ' . $response->getBody());
        }

        $data = json_decode($response->getBody(), true);
        Log::debug("Full allocation response:", $data);
        
        // Filter unassigned allocations
        $unassigned = array_filter($data['data'], function($allocation) {
            return $allocation['attributes']['assigned'] === false;
        });

        // Reindex array to ensure sequential keys
        $unassigned = array_values($unassigned);

        if (empty($unassigned)) {
            Log::warning("No unassigned allocations found for node " . $nodeId);
            return null;
        }

        // Safely get random allocation
        $randomIndex = array_rand($unassigned);
        $randomAllocation = $unassigned[$randomIndex];

        Log::info("Selected allocation:", ['id' => $randomAllocation['attributes']['id'], 'port' => $randomAllocation['attributes']['port']]);

        return [
            'id' => $randomAllocation['attributes']['id'],
            'port' => $randomAllocation['attributes']['port']
        ];

    } catch (\Exception $e) {
        Log::error("Error getting allocation: " . $e->getMessage());
        throw $e;
    }
}

    public function createUser($email, $username, $firstName, $lastName)
    {
        $response = $this->client->postAsync('/api/application/users', [
            'json' => [
                'email' => $email,
                'username' => $username,
                'first_name' => $firstName,
                'last_name' => $lastName
            ]
        ])->wait();

        if ($response->getStatusCode() !== 201) {
            Log::error('Failed to create user on Pterodactyl: ' . $response->getBody());
            throw new \Exception('Failed to create user on Pterodactyl: ' . $response->getBody());
        }

        return json_decode($response->getBody(), true);
    }

    public function getUserDetails($userId)
    {
        $response = $this->client->getAsync("/api/application/users/{$userId}")->wait();

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to fetch user details: ' . $response->getBody());
            throw new \Exception('Failed to fetch user details: ' . $response->getBody());
        }

        return json_decode($response->getBody(), true)['attributes'];
    }

    public function forceDeleteServer($serverId)
{
    Log::info("Force deleting server ID: {$serverId}");

    try {
        $response = $this->client->deleteAsync("/api/application/servers/{$serverId}/force")->wait();

        if ($response->getStatusCode() === 204) {
            Log::info("Successfully force deleted server: {$serverId}");
            return true;
        }

        Log::error("Failed to force delete server: {$serverId}", [
            'status' => $response->getStatusCode(),
            'response' => $response->getBody()->getContents()
        ]);
        
        throw new \Exception('Failed to force delete server: ' . $response->getBody());
    } catch (\Exception $e) {
        Log::error("Exception while force deleting server: {$serverId}", [
            'error' => $e->getMessage()
        ]);
        throw $e;
    }
}

    public function getUserServers($userId)
{
    Log::info("Fetching servers for user ID: {$userId}");

    $response = $this->client->getAsync("/api/application/users/{$userId}?include=servers")->wait();

    if ($response->getStatusCode() !== 200) {
        Log::error('Failed to fetch user servers: ' . $response->getBody());
        throw new \Exception('Failed to fetch user servers: ' . $response->getBody());
    }

    $data = json_decode($response->getBody(), true);
    
    Log::debug('Raw API response:', [
        'data' => $data
    ]);

    // Extract just the servers array from relationships
    $servers = $data['attributes']['relationships']['servers']['data'] ?? [];

    Log::info('Retrieved servers:', [
        'user_id' => $userId,
        'server_count' => count($servers),
        'servers' => array_map(function($server) {
            return [
                'id' => $server['attributes']['id'] ?? 'N/A',
                'name' => $server['attributes']['name'] ?? 'N/A'
            ];
        }, $servers)
    ]);

    return $servers;
}



    public function updateUserDetails($userId, $details)
    {
        $userDetails = $this->getUserDetails($userId);

        $updateData = array_merge($userDetails, $details);

        $response = $this->client->patchAsync("/api/application/users/{$userId}", [
            'json' => $updateData
        ])->wait();

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to update user details: ' . $response->getBody());
            throw new \Exception('Failed to update user details: ' . $response->getBody());
        }

        Log::info('User details updated successfully: ' . $response->getBody());

        return json_decode($response->getBody(), true)['attributes'];
    }

    public function getLocationDetails($locationId)
{
    $response = $this->client->getAsync("/api/application/locations/{$locationId}?include=nodes")->wait();

    if ($response->getStatusCode() !== 200) {
        Log::error('Failed to fetch location details: ' . $response->getBody());
        throw new \Exception('Failed to fetch location details: ' . $response->getBody());
    }

    $data = json_decode($response->getBody(), true);
    
    $nodes = [];
    if (isset($data['attributes']['relationships']['nodes']['data'])) {
        foreach ($data['attributes']['relationships']['nodes']['data'] as $node) {
            $nodes[] = [
                'id' => $node['attributes']['id'],
                'name' => $node['attributes']['name']
            ];
        }
    }

    return [
        'location_name' => $data['attributes']['short'],
        'nodes' => $nodes
    ];
}
    

    public function getEggDetails($nestId, $eggId)
{
    try {
        $response = $this->client->getAsync("/api/application/nests/{$nestId}/eggs/{$eggId}?include=config,variables&per_page=1000000000000000000000000000000000000000000000")->wait();

        if ($response->getStatusCode() === 404) {
            return null;
        }

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to fetch egg details: ' . $response->getBody());
            throw new \Exception('Failed to fetch egg details: ' . $response->getBody());
        }

        return json_decode($response->getBody(), true);
    } catch (\GuzzleHttp\Exception\ClientException $e) {
        if ($e->getResponse()->getStatusCode() === 404) {
            return null;
        }
        throw $e;
    }
}


}
