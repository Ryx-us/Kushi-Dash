<?php

namespace App\Http\Controllers\Pterodactyl;

use Illuminate\Http\Request;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

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
}

// lazy Copoilt code, I can't be bothered to write a proper description for this file nor code it
