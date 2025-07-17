<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;

class UserResourceController extends Controller
{
    public function refreshResources(Request $request, PterodactylService $pterodactylService)
    {
        $user = Auth::user();
        if (!$user || !$user->pterodactyl_id) {
            Log::warning("Manual resource refresh: User not found or no pterodactyl_id for user");
            return response()->json(['error' => 'User not found or no pterodactyl_id'], 404);
        }

        $startTime = microtime(true);

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

        $demoServersSkipped = 0;

        try {
            $servers = $pterodactylService->getUserServers($user->pterodactyl_id);

            if (!empty($servers) && is_array($servers)) {
                foreach ($servers as $server) {
                    if (!isset($server['attributes'])) continue;

                    if (isset($server['attributes']['name']) && 
                        (stripos($server['attributes']['name'], 'demo') !== false || 
                         stripos($server['attributes']['description'] ?? '', 'demo') !== false)) {
                        $demoServersSkipped++;
                        continue;
                    }

                    if (isset($server['attributes']['limits']) && 
                        (is_string($server['attributes']['limits']['memory'] ?? null) && 
                         strpos($server['attributes']['limits']['memory'] ?? '', 'Over 9 levels deep') !== false)) {
                        try {
                            $serverId = $server['attributes']['id'] ?? null;
                            if ($serverId) {
                                $serverDetails = $pterodactylService->getServerById($serverId);
                                if (isset($serverDetails['attributes']['name']) &&
                                    (stripos($serverDetails['attributes']['name'], 'demo') !== false || 
                                     stripos($serverDetails['attributes']['description'] ?? '', 'demo') !== false)) {
                                    $demoServersSkipped++;
                                    continue;
                                }
                                if ($serverDetails && isset($serverDetails['attributes']['limits'])) {
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
                                }
                            }
                        } catch (\Exception $e) {
                            $totalResources['memory'] += 1024;
                            $totalResources['disk'] += 10000;
                            $totalResources['cpu'] += 100;
                            $totalResources['allocations'] += 1;
                        }
                        continue;
                    }

                    if (isset($server['attributes']['limits'])) {
                        $limits = $server['attributes']['limits'];
                        $totalResources['memory'] += is_numeric($limits['memory'] ?? null) ? (int)$limits['memory'] : 0;
                        $totalResources['swap'] += is_numeric($limits['swap'] ?? null) ? (int)$limits['swap'] : 0;
                        $totalResources['disk'] += is_numeric($limits['disk'] ?? null) ? (int)$limits['disk'] : 0;
                        $totalResources['io'] += is_numeric($limits['io'] ?? null) ? (int)$limits['io'] : 0;
                        $totalResources['cpu'] += is_numeric($limits['cpu'] ?? null) ? (int)$limits['cpu'] : 0;
                    }

                    if (isset($server['attributes']['feature_limits'])) {
                        $featureLimits = $server['attributes']['feature_limits'];
                        $totalResources['databases'] += is_numeric($featureLimits['databases'] ?? null) ? (int)$featureLimits['databases'] : 0;
                        $totalResources['allocations'] += is_numeric($featureLimits['allocations'] ?? null) ? (int)$featureLimits['allocations'] : 0;
                        $totalResources['backups'] += is_numeric($featureLimits['backups'] ?? null) ? (int)$featureLimits['backups'] : 0;
                    }
                }

                $totalResources['servers'] = count($servers) - $demoServersSkipped;

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
                    $user->resources = $totalResources;
                    $user->save();
                }
            } else {
                $totalResources['servers'] = 0;
                $user->resources = $totalResources;
                $user->save();
            }

            $endTime = microtime(true);
            $executionTime = round(($endTime - $startTime) * 1000, 2);

            return response()->json([
                'message' => 'Resources refreshed!',
                'resources' => $user->resources,
                'demoServersSkipped' => $demoServersSkipped,
                'executionTimeMs' => $executionTime
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update resources: ' . $e->getMessage(), [
                'userId' => $user->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to refresh resources'], 500);
        }
    }
}
