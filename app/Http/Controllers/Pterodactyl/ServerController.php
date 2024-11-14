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

    public function getServers(Request $request, $user_id = null)
    {
        $startTime = microtime(true);

        try {
            $servers = $this->pterodactylService->getAllServers($user_id);

            $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds

            if ($request->isMethod('get')) {
                return response()->json(['servers' => $servers, 'execution_time_ms' => $executionTime]);
            } elseif ($request->isMethod('post')) {
                return back()->with(['res' => $servers, 'execution_time_ms' => $executionTime]);
            }
        } catch (\Exception $e) {
            $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
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

    public function store(Request $request)
{
    $discordId = $request->user()->discord_id;
    $user = User::where('discord_id', $discordId)->first();

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

    return response()->json([
        'message' => 'Testing Received!',
        'data' => $request->all(),
        'user' => [
            'id' => $user->id,
            'pterodactyl_id' => $user->pterodactyl_id,
            'limits' => $user->limits,
            'resources' => $user->resources,
            'remaining' => $remaining,
            'rank' => $user->rank
        ]
    ]);
}
}

// lazy Copoilt code, I can't be bothered to write a proper description for this file nor code it
