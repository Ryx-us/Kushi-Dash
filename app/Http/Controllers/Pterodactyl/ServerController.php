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

        // Check rank requirements
        if ($location->requiredRank === 'admin' && !$user->rank) {
            return back()->with('status', 'Error: This location requires admin privileges');
        }
        if ($location->requiredRank === 'premium' && $user->rank !== 'premium' && $user->rank !== 'admin') {
            return back()->with('status', 'Error: This location requires premium privileges');
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

        // Validate requested resources
        $requested = [
            'cpu' => $request->cpu,
            'memory' => $request->memory,
            'disk' => $request->disk,
            'databases' => $request->databases ?? 0,
            'backups' => $request->backups ?? 0,
            'allocations' => $request->allocations ?? 1
        ];

        foreach ($requested as $resource => $amount) {
            if ($amount > $remaining[$resource]) {
                return back()->with('status', "Error: You don't have enough {$resource} resources (Requested: {$amount}, Available: {$remaining[$resource]})");
            }
        }

        // Get egg details
        $eggDetails = $pterodactylService->getEggDetails($egg->nestId, $egg->EggID);
        
        // Build environment variables
        $environment = [];
        if (isset($eggDetails['attributes']['relationships']['variables']['data'])) {
            foreach ($eggDetails['attributes']['relationships']['variables']['data'] as $variable) {
                $attr = $variable['attributes'];
                
                if (!empty($attr['default_value'])) {
                    $environment[$attr['env_variable']] = $attr['default_value'];
                } else if (strpos($attr['rules'], 'in:') !== false) {
                    preg_match('/in:([^|]+)/', $attr['rules'], $matches);
                    if (isset($matches[1])) {
                        $environment[$attr['env_variable']] = $matches[1];
                    }
                } else if ($attr['rules'] === 'required|string') {
                    $customVars = $egg->additional_environmental_variables;
                    $matched = array_filter($customVars, fn($v) => $v['name'] === $attr['name']);
                    if (!empty($matched)) {
                        $environment[$attr['env_variable']] = reset($matched)['value'];
                    }
                }
            }
        }

        // Create server
        $server = $pterodactylService->createServer(
            $request->name,
            $user->pterodactyl_id,
            $eggDetails['attributes']['id'],
            $eggDetails['attributes']['docker_image'],
            $environment,
            [
                'memory' => $request->memory,
                'disk' => $request->disk,
                'cpu' => $request->cpu,
                'io' => 500,
                'swap' => 0
            ],
            [
                'databases' => $request->databases ?? 0,
                'backups' => $request->backups ?? 0
            ],
            $allocation['id'],
            $eggDetails['attributes']['startup'] ?? null
        );

        $user->resources = [
            'cpu' => $user->resources['cpu'] + $request->cpu,
            'memory' => $user->resources['memory'] + $request->memory,
            'disk' => $user->resources['disk'] + $request->disk,
            'servers' => $user->resources['servers'] + 1,
            'databases' => $user->resources['databases'] + ($request->databases ?? 0),
            'backups' => $user->resources['backups'] + ($request->backups ?? 0),
            'allocations' => $user->resources['allocations'] + ($request->allocations ?? 1)
        ];

        $user->save();

        $serverUrl = env('PTERODACTYL_API_URL') . '/server/' . $server['attributes']['identifier'];
        
        return back()->with([
            'status' => 'Success: Your server has been successfully created',
            'server_url' => $serverUrl,
            'server_id' => $server['attributes']['identifier']
        ]);

    } catch (\Exception $e) {
        Log::error('Server creation failed: ' . $e->getMessage());
        return back()->with('status', 'Error: Unable to create server at this time. Please try again later.');
    }
}
}

// lazy Copoilt code, I can't be bothered to write a proper description for this file nor code it
