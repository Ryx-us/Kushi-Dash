<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Promise\Utils;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Cache;

class PterodactylService
{
    protected $apiUrl;
    protected $apiKey;
    protected $client;
    /**
     * Creates a new server in Pterodactyl.
     *
     * @param string $name
     * @param int $userId
     * @param int $eggId
     * @param string $dockerImage
     * @param array $environment
     * @param array $limits
     * @param array $featureLimits
     * @param int $allocation
     * @param string|null $startup
     * @return array|null
     */

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

    /**
     * Create a new server with the given payload.
     *
     * @param array $payload
     * @return array|null
     */
    public function createServer(array $payload)
    {
        try {
            $response = $this->client->post('/api/application/servers', [
                'json' => $payload
            ]);

            $data = json_decode($response->getBody(), true);
            Log::info('Server created successfully:', $data);

            return $data;
        } catch (\Exception $e) {
            Log::error('Failed to create server: ' . $e->getMessage());
            return null;
        }
    }

    public function getServerDetails($serverId)
{
    try {
        Log::info("Fetching details for server ID: {$serverId}");

        $response = $this->client->getAsync("/api/application/servers/{$serverId}")->wait();

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to fetch server details: ' . $response->getBody());
            throw new \Exception('Failed to fetch server details: ' . $response->getBody());
        }

        return json_decode($response->getBody(), true);
    } catch (\Exception $e) {
        Log::error("Error fetching server details: " . $e->getMessage());
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
    // Function to sanitize input by replacing non-alphanumeric characters with 'X'
    $sanitize = function($input) {
        return preg_replace('/[^a-zA-Z0-9]/', 'X', $input);
    };

    // Sanitize the fields except email
    $sanitizedUsername = $sanitize($username);
    $sanitizedFirstName = $sanitize($firstName);
    $sanitizedLastName = $sanitize($lastName);

    $response = $this->client->postAsync('/api/application/users', [
        'json' => [
            'email' => $email,
            'username' => $sanitizedUsername,
            'first_name' => $sanitizedFirstName,
            'last_name' => $sanitizedLastName
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

    try {
        $response = $this->client->getAsync("/api/application/users/{$userId}?include=servers")->wait();

        if ($response->getStatusCode() === 200) {
            $data = json_decode($response->getBody(), true);
            
            Log::debug('Raw API response:', [
                'data' => $data
            ]);

            // Extract the servers array from relationships
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
        } elseif ($response->getStatusCode() === 404) {
            Log::warning("User ID {$userId} not found or no servers available.");
            return null;
        } else {
            Log::error('Unexpected response while fetching user servers: ' . $response->getBody());
            throw new \Exception('Unexpected error fetching user servers.');
        }
    } catch (\GuzzleHttp\Exception\ClientException $e) {
        // Handle 404 Not Found separately
        if ($e->getResponse() && $e->getResponse()->getStatusCode() === 404) {
            Log::warning("User ID {$userId} not found or no servers available.");
            return null;
        }

        // Rethrow other client exceptions
        Log::error('Client error while fetching user servers: ' . $e->getMessage());
        throw new \Exception('Client error fetching user servers.');
    } catch (\Exception $e) {
        // Handle other exceptions
        Log::error('Failed to fetch user servers: ' . $e->getMessage());
        throw new \Exception('Failed to fetch user servers.');
    }
}




public function updateUserDetails($userId, $details)
{
    try {
        Log::info('updateUserDetails: Method called.', ['userId' => $userId, 'details' => $details]);

        $userDetails = $this->getUserDetails($userId);
        Log::info('updateUserDetails: Retrieved user details.', ['userDetails' => $userDetails]);

        $updateData = array_merge($userDetails, $details);
        Log::info('updateUserDetails: Merged update data.', ['updateData' => $updateData]);

        $response = $this->client->patchAsync("/api/application/users/{$userId}", [
            'json' => $updateData
        ])->wait();

        if ($response->getStatusCode() !== 200) {
            Log::error('updateUserDetails: Failed to update user details.', [
                'statusCode' => $response->getStatusCode(),
                'responseBody' => $response->getBody()->getContents()
            ]);
            throw new \Exception('Failed to update user details: ' . $response->getBody()->getContents());
        }

        Log::info('updateUserDetails: User details updated successfully.', [
            'responseBody' => $response->getBody()->getContents()
        ]);

        return json_decode($response->getBody(), true)['attributes'];
    } catch (\GuzzleHttp\Exception\ClientException $e) {
        Log::error('ClientException in updateUserDetails: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : 'No response body'
        ]);
        throw $e;
    } catch (\GuzzleHttp\Exception\ServerException $e) {
        Log::error('ServerException in updateUserDetails: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : 'No response body'
        ]);
        throw $e;
    } catch (\GuzzleHttp\Exception\ConnectException $e) {
        Log::error('ConnectException in updateUserDetails: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        throw $e;
    } catch (\Exception $e) {
        Log::error('Exception in updateUserDetails: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        throw $e;
    }
}

    public function updateServerBuild($serverId, array $build)
{
    try {
        Log::info("Updating server build for server ID: {$serverId}", $build);

        $response = $this->client->patchAsync("/api/application/servers/{$serverId}/build", [
            'json' => $build
        ])->wait();

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to update server build: ' . $response->getBody());
            throw new \Exception('Failed to update server build: ' . $response->getBody());
        }

        return json_decode($response->getBody(), true);
    } catch (\Exception $e) {
        Log::error("Error updating server build: " . $e->getMessage());
        throw $e;
    }
}

    //START FROM HERE
    

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


