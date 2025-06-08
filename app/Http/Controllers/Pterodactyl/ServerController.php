<?php

namespace App\Http\Controllers\Pterodactyl;

use Illuminate\Http\Request;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Location; 
use Inertia\Inertia;
use App\Models\PterodactylEggs;
use App\Http\Controllers\Pterodactyl\PterodactylEggController;
use App\Models\User;


class ServerController extends Controller
{
    protected $pterodactylService;

    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
    }

    public function deleteServer(Request $request, $server_id)
{
    try {
        $this->pterodactylService->forceDeleteServer($server_id);

        if ($request->isMethod('get')) {
            return response()->json([
                'message' => 'Server deleted successfully'
            ]);
        } else {
            return back()
                ->with('status', 'Server deleted successfully');
        }
    } catch (\Exception $e) {
        Log::error('Server deletion failed:', [
            'server_id' => $server_id,
            'error' => $e->getMessage()
        ]);

        if ($request->isMethod('get')) {
            return response()->json([
                'error' => 'Failed to delete server'
            ], 500);
        } else {
            return back()
                ->withErrors(['error' => 'Failed to delete server']);
        }
    }
}

    public function getServers(Request $request, $user_id = null)
{
    $startTime = microtime(true);

    try {
        // Use getUserServers instead of getAllServers when user_id is provided
        $servers = $user_id 
            ? $this->pterodactylService->getUserServers($user_id)
            : $this->pterodactylService->getAllServers();
            
        // Convert null to empty array
        $servers = $servers ?? [];

        $executionTime = (microtime(true) - $startTime) * 1000;

        if ($request->isMethod('get')) {
            return response()->json(['servers' => $servers, 'execution_time_ms' => $executionTime]);
        } elseif ($request->isMethod('post')) {
            return back()
                ->with(['res' => $servers, 'execution_time_ms' => $executionTime])
                ->with('message', 'Servers: ' . implode(', ', array_column($servers, 'name')));
        }
    } catch (\Exception $e) {
        $executionTime = (microtime(true) - $startTime) * 1000;
        Log::error('Failed to fetch servers:', ['error' => $e->getMessage(), 'execution_time_ms' => $executionTime]);

        if ($request->isMethod('get')) {
            return response()->json(['error' => 'Failed to fetch servers.', 'execution_time_ms' => $executionTime], 500);
        } elseif ($request->isMethod('post')) {
            return back()->withErrors(['error' => 'Failed to fetch servers.', 'execution_time_ms' => $executionTime]);
        }
    }
}
    

    public function create()
    {
        $locations = Location::all();
        $eggs = PterodactylEggs::all();

        return Inertia::render('User/Create', [
            'locations' => $locations,
            'eggs' => $eggs,
        ]);
    }

    

    



public function store(Request $request, PterodactylService $pterodactylService)
{
    try {
        Log::info('Incoming server creation request:', $request->all());

        // Get user data with rank check
        $user = User::where('discord_id', $request->user()->discord_id)->first();
        if (!$user->pterodactyl_id) {
            return back()->with('status', 'Error: Your account is not properly linked');
        }

        // Get egg data
        $egg = PterodactylEggs::where('id', $request->egg_id)->first();
        if (!$egg) {
            return back()->with('status', 'Error: Invalid server type selected');
        }

        // Check location and rank requirements
        $location = Location::where('platform', $request->location_id)->first();
        if (!$location) {
            return back()->with('status', 'Error: Invalid location selected');
        }

        // Check if this is a demo server request
        $isDemo = $request->input('is_demo', false) && env('DEMO', false);

        if ($isDemo) {
    $existingDemoServer = \App\Models\DemoServer::where('user_id', $user->id)
        ->where('expires_at', '>', now())
        ->first();
    
    if ($existingDemoServer) {
        Log::info('Demo server creation blocked: User already has an active demo server', [
            'user_id' => $user->id,
            'existing_demo_server_id' => $existingDemoServer->server_id
        ]);
        
        // Get the server URL for the existing demo server
        $serverUrl = env('PTERODACTYL_API_URL') . '/server/' . $existingDemoServer->server_identifier;
        
        return back()->with([
            'status' => 'Error: You already have an active demo server. You can only have one demo server at a time.',
            'server_url' => $serverUrl,
            'server_id' => $existingDemoServer->server_identifier,
            'is_demo' => true
        ]);
    }
}
        
        // Check rank requirements (bypass if demo mode)
        if (!$isDemo) {
            if ($location->requiredRank === 'admin' && !$user->rank) {
                return back()->with('status', 'Error: This location requires admin privileges');
            }
            if ($location->requiredRank === 'premium' && $user->rank !== 'premium' && $user->rank !== 'admin') {
                return back()->with('status', 'Error: This location requires premium privileges');
            }
        }

        // Get location details with nodes
        $locationDetails = $pterodactylService->getLocationDetails($request->location_id);
        if (!$locationDetails || empty($locationDetails['nodes'])) {
            return back()->with('status', 'Error: No nodes available in this location');
        }

        // Get random node
        $randomNode = $locationDetails['nodes'][array_rand($locationDetails['nodes'])];

        // Get allocation
        $allocation = $pterodactylService->getRandomUnassignedAllocation($randomNode['id']);
        if (!$allocation) {
            return back()->with('status', 'Error: No available ports in this location');
        }

        // Validate requested ports
        $requestedPorts = $request->allocations ?? 1; // Default to 1 port

        // Check if user has enough allocations for all ports (1 default + additional)
        // Bypass resource check if demo
        if (!$isDemo && !$user->hasEnoughAllocations($requestedPorts + 1)) {
            $available = $user->limits['allocations'] - $user->resources['allocations'];
            return back()->with('status', "Error: Not enough allocation slots. Need: " . ($requestedPorts) . ", Available: " . $available);
        }

        // Calculate remaining resources
        $remaining = [
            'cpu' => $user->limits['cpu'] - $user->resources['cpu'],
            'memory' => $user->limits['memory'] - $user->resources['memory'],
            'disk' => $user->limits['disk'] - $user->resources['disk'],
            'servers' => $user->limits['servers'] - $user->resources['servers'],
            'databases' => $user->limits['databases'] - $user->resources['databases'],
            'backups' => $user->limits['backups'] - $user->resources['backups'],
            'allocations' => $user->limits['allocations'] - $user->resources['allocations']
        ];

        // Default demo resources
        $demoResources = [
            'cpu' => 250,
            'memory' => 4096,
            'disk' => 5120,
            'databases' => 1,
            'backups' => 1,
            'allocations' => 1
        ];

        // Validate requested resources
        $requested = [
            'cpu' => $isDemo ? $demoResources['cpu'] : $request->cpu,
            'memory' => $isDemo ? $demoResources['memory'] : $request->memory,
            'disk' => $isDemo ? $demoResources['disk'] : $request->disk,
            'databases' => $isDemo ? $demoResources['databases'] : ($request->databases ?? 0),
            'backups' => $isDemo ? $demoResources['backups'] : ($request->backups ?? 0),
            'allocations' => $isDemo ? $demoResources['allocations'] : $requestedPorts
        ];

        // Check if there are server slots left (bypass if demo)
        if (!$isDemo && $remaining['servers'] < 1) {
            return back()->with('status', "Error: No Server Slots left :(");
        }

        // Check resources (bypass if demo)
        if (!$isDemo) {
            foreach ($requested as $resource => $amount) {
                if ($amount > $remaining[$resource]) {
                    return back()->with('status', "Error: You don't have enough {$resource} resources (Requested: {$amount}, Available: {$remaining[$resource]})");
                }
            }
        }

        // Get egg details
        $eggDetails = $pterodactylService->getEggDetails($egg->nestId, $egg->EggID);
        if (!$eggDetails || !isset($eggDetails['attributes'])) {
            return back()->with('status', 'Error: Unable to retrieve egg details');
        }

        Log::info('Egg service response:', $eggDetails);

        // Build environment variables
        $environment = [];
        $variables = $eggDetails['attributes']['relationships']['variables']['data'] ?? [];

        foreach ($variables as $variable) {
            $attr = $variable['attributes'];
            $envVar = $attr['env_variable'];

            if (!empty($attr['default_value'])) {
                $environment[$envVar] = $attr['default_value'];
            }

            if (strpos($attr['rules'], 'required') !== false) {
                $value = $request->input($envVar, $attr['default_value']);
                if (empty($value) && $attr['rules'] !== 'required|boolean') {
                    return back()->with('status', "Error: Missing value for {$envVar}");
                }
                $environment[$envVar] = $value;
            }

            if (strpos($attr['rules'], 'boolean') !== false && !isset($environment[$envVar])) {
                $environment[$envVar] = $request->input($envVar, '0');
            }
        }

        Log::info('Environment variables:', $environment);

        // Add demo name prefix if demo server
        $serverName = $isDemo ? "DEMO-" . $request->name : $request->name;

        // Continue with server creation...
        $serverPayload = [
            'name' => $serverName,
            'user' => (int) $user->pterodactyl_id,
            'egg' => (int) $egg->EggID,
            'docker_image' => $eggDetails['attributes']['docker_image'],
            'startup' => $eggDetails['attributes']['startup'],
            'environment' => $environment,
            'limits' => [
                'memory' => (int) $requested['memory'],
                'swap' => 0,
                'disk' => (int) $requested['disk'],
                'io' => 500,
                'cpu' => (int) $requested['cpu'],
            ],
            'feature_limits' => [
                'databases' => (int) $requested['databases'],
                'backups' => (int) $requested['backups'],
                'allocations' => (int) $requested['allocations']
            ],
            'allocation' => [
                'default' => $allocation['id'],
            ],
        ];

        Log::info('Creating server with payload:', ['payload' => $serverPayload]);

        $server = $pterodactylService->createServer($serverPayload);

        // Only update user resources if not a demo server
        if (!$isDemo) {
            $user->resources = [
                'cpu' => $user->resources['cpu'] + $requested['cpu'],
                'memory' => $user->resources['memory'] + $requested['memory'],
                'disk' => $user->resources['disk'] + $requested['disk'],
                'servers' => $user->resources['servers'] + 1,
                'databases' => $user->resources['databases'] + $requested['databases'],
                'backups' => $user->resources['backups'] + $requested['backups'],
                'allocations' => $user->resources['allocations'] + $requested['allocations']
            ];
            $user->save();
        }

        // If this is a demo server, create a record in the DemoServer table
        if ($isDemo) {
            \App\Models\DemoServer::create([
                'server_id' => $server['attributes']['id'],
                'user_id' => $user->id,
                'expires_at' => now()->addSeconds(20),
                'server_identifier' => $server['attributes']['identifier'],
            ]);
        }

        $serverUrl = env('PTERODACTYL_API_URL') . '/server/' . $server['attributes']['identifier'];

        return back()->with([
            'status' => $isDemo ? 'Success: Your demo server has been created! It will expire in 48 hours.' : 'Success: Your server has been successfully created',
            'server_url' => $serverUrl,
            'server_id' => $server['attributes']['identifier'],
            'is_demo' => $isDemo
        ]);

    } catch (\Exception $e) {
        Log::error('Server creation failed: ' . $e->getMessage());
        return back()->with('status', 'Error: Unable to create server at this time. Please try again later.');
    }
}




public function update(Request $request, PterodactylService $pterodactylService, $serverId)
{
    try {
        // Log the incoming request data
        Log::info('Incoming server update request:', $request->all());

        // Get user data with rank check
        $user = User::where('discord_id', $request->user()->discord_id)->first();
        if (!$user->pterodactyl_id) {
            return back()->with('status', 'Error: Your account is not properly linked');
        }

        // Fetch current server details
        $serverDetails = $pterodactylService->getServerDetails($serverId);
        if (!$serverDetails) {
            return back()->with('status', 'Error: Unable to fetch server details');
        }

        // Calculate the new resource usage
        $newMemory = $request->input('memory', $serverDetails['attributes']['limits']['memory']);
        $newCpu = $request->input('cpu', $serverDetails['attributes']['limits']['cpu']);
        $newDisk = $request->input('disk', $serverDetails['attributes']['limits']['disk']);
        $newDatabases = $request->input('databases', $serverDetails['attributes']['feature_limits']['databases']);
        $newAllocations = $request->input('allocations', $serverDetails['attributes']['feature_limits']['allocations']);
        $newBackups = $request->input('backups', $serverDetails['attributes']['feature_limits']['backups']);

        // Check if the new resource usage surpasses the user's limits
        if (
            $newMemory > $user->limits['memory'] ||
            $newCpu > $user->limits['cpu'] ||
            $newDisk > $user->limits['disk'] ||
            $newDatabases > $user->limits['databases'] ||
            $newAllocations > $user->limits['allocations'] ||
            $newBackups > $user->limits['backups']
        ) {
            return back()->with('status', 'Error: Surpasses User resources');
        }

        // Prepare the build payload
        $build = [
            'allocation' => $serverDetails['attributes']['allocation'], // Keep the same allocation
            'memory' => $newMemory,
            'swap' => $serverDetails['attributes']['limits']['swap'], // Keep the same swap
            'disk' => $newDisk,
            'io' => $serverDetails['attributes']['limits']['io'], // Keep the same IO
            'cpu' => $newCpu,
            'threads' => $serverDetails['attributes']['limits']['threads'], // Keep the same threads
            'feature_limits' => [
                'databases' => $newDatabases,
                'allocations' => $newAllocations,
                'backups' => $newBackups,
            ]
        ];

        // Update the server build
        $updatedServer = $pterodactylService->updateServerBuild($serverId, $build);

        Log::info('Server updated successfully:', $updatedServer);

        return back()->with('status', 'Success: Your server has been successfully updated');
    } catch (\Exception $e) {
        Log::error('Server update failed: ' . $e->getMessage());
        return back()->with('status', 'Error: Unable to update server at this time. Please try again later.');
    }
}


    //sister leviing

    
public function edit($serverId, PterodactylService $pterodactylService)
{
    try {
        // Fetch current server details
        $serverDetails = $pterodactylService->getServerDetails($serverId);
        if (!$serverDetails) {
            return back()->with('status', 'Error: Unable to fetch server details');
        }

        // Get the authenticated user
        $user = auth()->user();

        // Check if the server belongs to the user
        if ($serverDetails['attributes']['user'] != $user->pterodactyl_id) {
            return redirect('/dashboard')->with('status', 'Error: This server is not yours');
        }

        return Inertia::render('User/ServerEdit', [
            'server' => $serverDetails['attributes']
        ]);
    } catch (\Exception $e) {
        Log::error('Failed to fetch server details: ' . $e->getMessage());
        return back()->with('status', 'Error: Unable to fetch server details at this time. Please try again later.');
    }
}
}

// lazy Copoilt code, I can't be bothered to write a proper description for this file nor code it
