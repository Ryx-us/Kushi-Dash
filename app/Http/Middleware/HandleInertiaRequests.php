<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;
use App\Services\PterodactylService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    // protected $rootView = 'app';

    /**
     * PterodactylService instance.
     *
     * @var PterodactylService
     */
    protected $pterodactylService;

    /**
     * Create a new middleware instance.
     *
     * @param  PterodactylService  $pterodactylService
     */
    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
    }

    /**
     * Define the props that are shared by default.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Initialize totalResources with default zero values
        $totalResources = [
            'memory' => 0,
            'swap'   => 0,
            'disk'   => 0,
            'io'     => 0,
            'cpu'    => 0,
        ];

        if ($user && $user->pterodactyl_id) {
            try {
                $servers = $this->pterodactylService->getUserServers($user->pterodactyl_id);

                // Check if $servers is a non-empty array
                if (!empty($servers) && is_array($servers)) {
                    foreach ($servers as $server) {
                        // Ensure 'attributes' and 'limits' exist to prevent undefined index errors
                        if (isset($server['attributes']['limits'])) {
                            $limits = $server['attributes']['limits'];

                            // Safely add each limit, defaulting to 0 if not set
                            $totalResources['memory'] += isset($limits['memory']) ? (int)$limits['memory'] : 0;
                            $totalResources['swap']   += isset($limits['swap']) ? (int)$limits['swap'] : 0;
                            $totalResources['disk']   += isset($limits['disk']) ? (int)$limits['disk'] : 0;
                            $totalResources['io']     += isset($limits['io']) ? (int)$limits['io'] : 0;
                            $totalResources['cpu']    += isset($limits['cpu']) ? (int)$limits['cpu'] : 0;
                        } else {
                            Log::warning("Server data malformed for user ID {$user->pterodactyl_id}.");
                        }
                    }

                    // Update user's resources in database
                    $user->resources = [
                        'cpu'         => $totalResources['cpu'],
                        'memory'      => $totalResources['memory'],
                        'disk'        => $totalResources['disk'],
                        'databases'   => $user->resources['databases'],
                        'allocations' => $user->resources['allocations'],
                        'backups'     => $user->resources['backups'],
                        'servers'     => count($servers),
                    ];
                    $user->save();

                    Log::info('Updated user resources:', $user->resources);
                } else {
                    // Log that no servers were found or $servers is not an array
                    Log::info("No servers found for user ID: {$user->pterodactyl_id}.");

                    // Optionally, ensure that 'servers' count is set to 0
                    $user->resources = [
                        'cpu'         => 0,
                        'memory'      => 0,
                        'disk'        => 0,
                        'databases'   => $user->resources['databases'],
                        'allocations' => $user->resources['allocations'],
                        'backups'     => $user->resources['backups'],
                        'servers'     => 0,
                    ];
                    $user->save();
                }
            } catch (\Exception $e) {
                Log::error('Failed to fetch/update server resources: ' . $e->getMessage());
                // Depending on your application logic, you might want to handle this differently
            }
        } else {
            if ($user) {
                Log::warning("User ID {$user->id} does not have a pterodactyl_id.");
            } else {
                Log::info("No authenticated user found.");
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user
            ],
            'totalResources' => $totalResources,
            'linkvertiseEnabled' => config('linkvertise.enabled'),
            'linkvertiseId'      => config('linkvertise.id'),
            'pterodactyl_URL'    => env('PTERODACTYL_API_URL'),
        ]);
    }
}