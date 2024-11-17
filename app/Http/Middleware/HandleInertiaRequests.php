<?php
namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;

use App\Services\PterodactylService;

class HandleInertiaRequests extends Middleware
{
    protected $pterodactylService;

    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $totalResources = ['memory' => 0, 'swap' => 0, 'disk' => 0, 'io' => 0, 'cpu' => 0];

        if ($user && $user->pterodactyl_id) {
            try {
                $servers = $this->pterodactylService->getUserServers($user->pterodactyl_id);
                
                // Sum up resources from all servers
                foreach ($servers as $server) {
                    $limits = $server['attributes']['limits'];
                    $totalResources['memory'] += $limits['memory'];
                    $totalResources['swap'] += $limits['swap'];
                    $totalResources['disk'] += $limits['disk'];
                    $totalResources['io'] += $limits['io'];
                    $totalResources['cpu'] += $limits['cpu'];
                }

                // Update user's resources in database
                $user->resources = [
                    'cpu' => $totalResources['cpu'],
                    'memory' => $totalResources['memory'],
                    'disk' => $totalResources['disk'],
                    'databases' => $user->resources['databases'],
                    'allocations' => $user->resources['allocations'],
                    'backups' => $user->resources['backups'],
                    'servers' => count($servers)
                ];
                $user->save();

                Log::info('Updated user resources:', $user->resources);
            } catch (\Exception $e) {
                Log::error('Failed to fetch/update server resources: ' . $e->getMessage());
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user
            ],
            'linkvertiseEnabled' => config('linkvertise.enabled'),
            'linkvertiseId' => config('linkvertise.id'),
        ];
    }
}