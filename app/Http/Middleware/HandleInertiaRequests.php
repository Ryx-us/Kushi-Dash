<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Cache;
use App\Jobs\UpdateUserResources;
use App\Jobs\SuspendExpiredDemoServers;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

/**
 * This is where the Jobs are run
 * To restart or Refersh a Job runner, reset or change the config on a 
 * server to reset cache and restart ALL jobs.
 * 
 * Job runner of Kushi-Dash
 */


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
     * Request start time.
     *
     * @var float
     */
    protected $startTime;

    /**
     * Create a new middleware instance.
     *
     * @param  PterodactylService  $pterodactylService
     */
    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
        $this->startTime = microtime(true);
    }

    /**
     * Define the props that are shared by default.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function share(Request $request): array
    {
        $this->startTime = microtime(true);
        $user = $request->user();

        // Initialize totalResources with default zero values
        $totalResources = [
            'memory' => 0,
            'swap'   => 0,
            'disk'   => 0,
            'io'     => 0,
            'cpu'    => 0,
            'databases' => 0,
            'allocations' => 0,
            'backups' => 0,
            'servers' => 0,
        ];

        $shopPrices = config('shop.prices');

        if ($user) {
            SuspendExpiredDemoServers::dispatch($user->id);
        }

        if ($user && $user->pterodactyl_id) {
            // Check if we need to refresh the cache or get new data
            $cacheKey = 'user_resources_' . $user->id;
            $forceRefresh = $request->has('refresh_resources') || !Cache::has($cacheKey);
            
            // Check if user has demo servers
            $hasDemo = $this->userHasDemoServers($user->id);
            
            try {
                // Get Go service URL
                $goServiceUrl = env('GO_SERVICE_URL', 'http://localhost:8081');
                
                if ($forceRefresh) {
                    // Use the Go service to refresh the data
                    $client = new Client(['timeout' => 5.0]);
                    
                    // Add demo parameter if needed
                    $endpoint = "/update-user/{$user->id}";
                    if ($hasDemo) {
                        $endpoint .= "?demo=true";
                    }
                    
                    // Make the request to refresh data
                    $response = $client->get($goServiceUrl . $endpoint);
                    
                    Log::info("Refreshed resources for user {$user->id} using Go service");
                    
                    // Get the data from the Go service
                    $endpoint = "/get-resources/{$user->id}";
                    $response = $client->get($goServiceUrl . $endpoint);
                    
                    if ($response->getStatusCode() === 200) {
                        $data = json_decode($response->getBody(), true);
                        
                        if (isset($data['totalResources'])) {
                            $totalResources = $data['totalResources'];
                            
                            // Cache the result for future requests
                            Cache::put($cacheKey, [
                                'totalResources' => $totalResources,
                                'serverCount' => $totalResources['servers'] ?? 0
                            ], 300);
                        }
                    }
                } else {
                    // Get cached resources if available
                    $cachedData = Cache::get($cacheKey);
                    
                    if ($cachedData) {
                        $totalResources = $cachedData['totalResources'];
                        Log::info("Using cached resources for user {$user->id}");
                    } else {
                        // If no cache but we have resources in the user model
                        $totalResources = $user->resources ?: $totalResources;
                        
                        // Store in cache for future requests
                        Cache::put($cacheKey, [
                            'totalResources' => $totalResources,
                            'serverCount' => $totalResources['servers'] ?? 0
                        ], 300);
                        
                        // Trigger background update for next time
                        try {
                            $client = new Client(['timeout' => 0.5]);
                            $endpoint = "/update-user/{$user->id}";
                            if ($hasDemo) {
                                $endpoint .= "?demo=true";
                            }
                            $client->get($goServiceUrl . $endpoint);
                        } catch (RequestException $e) {
                            // Ignore errors for background requests
                        }
                    }
                }
            } catch (\Exception $e) {
                // If Go service fails, fall back to the original method
                Log::error("Error using Go service: " . $e->getMessage() . ". Falling back to Laravel job.");
                
                if ($forceRefresh) {
                    // Dispatch job to update resources in the background
                    UpdateUserResources::dispatch($user->id);
                    Log::info("Dispatched UpdateUserResources job for user {$user->id}");
                    
                    // If no cached data exists yet, use the resources from the user model
                    if (!Cache::has($cacheKey) && !empty($user->resources)) {
                        $totalResources = $user->resources;
                    }
                } else {
                    // Get cached resources if available
                    $cachedData = Cache::get($cacheKey);
                    
                    if ($cachedData) {
                        $totalResources = $cachedData['totalResources'];
                    } else {
                        // If no cache but we have resources in the user model
                        $totalResources = $user->resources ?: $totalResources;
                        
                        // Store in cache for future requests
                        Cache::put($cacheKey, [
                            'totalResources' => $totalResources,
                            'serverCount' => $totalResources['servers'] ?? 0
                        ], 300);
                    }
                }
            }
        } else {
            if ($user) {
                Log::warning("User ID {$user->id} does not have a pterodactyl_id.");
            } else {
                Log::info("No authenticated user found.");
            }
        }

        $vmsEnabled = config('services.vms.enabled', false);
        $vmsAccessLevel = env('VMS_ACCESS_LEVEL', 'null');

        $vmsConfig = [
            'enabled' => $vmsEnabled,
            'accessLevel' => $vmsAccessLevel,
        ];

        // Calculate the time taken to process the request
        $endTime = microtime(true);
        $executionTime = round(($endTime - $this->startTime) * 1000, 2); // Convert to milliseconds

        return array_merge(parent::share($request), [
            'auth' => [
               'user' => $user ?? null
            ],
            'shop' => [
                'prices' => $shopPrices,
                'userCoins' => $user ? $user->coins : 0,
                'maxPurchaseAmounts' => [
                    'cpu' => config('shop.max_cpu', 69),
                    'memory' => config('shop.max_memory', 4096),
                    'disk' => config('shop.max_disk', 10240),
                    'databases' => config('shop.max_databases', 5),
                    'allocations' => config('shop.max_allocations', 5),
                    'backups' => config('shop.max_backups', 5),
                ],
            ],

            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
                'res' => fn () => $request->session()->get('res'),
                'servers' => fn () => $request->session()->get('servers'),
                'success' => fn () => $request->session()->get('success'),
                'users' => fn () => $request->session()->get('users'),
                'server_url' => fn () => $request->session()->get('server_url'),
                'secerts' => fn () => $request->session()->get('secerts'),
                'linkvertiseUrl' => fn () => $request->session()->get('linkvertiseUrl'),
            ],
            
            'totalResources' => $totalResources,
            'linkvertiseEnabled' => config('linkvertise.enabled'),
            'linkvertiseId'      => config('linkvertise.id'),
            'pterodactyl_URL'    => env('PTERODACTYL_API_URL'),
            'vmsConfig'          => $vmsConfig,
            'debug' => [
                'requestTime' => $executionTime . 'ms',
                'requestStarted' => date('Y-m-d H:i:s', (int)$this->startTime),
                'requestEnded' => date('Y-m-d H:i:s', (int)$endTime),
                'requestPath' => $request->path(),
                'requestMethod' => $request->method(),
                'serverLoad' => sys_getloadavg()[0],
                'memory' => round(memory_get_usage() / 1024 / 1024, 2) . 'MB',
                'cacheHit' => !($request->has('refresh_resources') || !Cache::has('user_resources_' . ($user ? $user->id : 0))),
                'usingGoService' => true
            ]
        ]);
    }

    /**
     * Check if a user has demo servers.
     *
     * @param int $userId
     * @return bool
     */
    protected function userHasDemoServers($userId)
    {
        // Try to get from cache first to avoid repeated checks
        $cacheKey = 'user_has_demo_' . $userId;
        
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }
        
        try {
            // Get the user's servers
            $servers = $this->pterodactylService->getUserServers($userId);
            
            // Check if any server name or description contains "demo"
            $hasDemo = false;
            
            if (isset($servers['data']) && is_array($servers['data'])) {
                foreach ($servers['data'] as $server) {
                    if (isset($server['attributes'])) {
                        $name = strtolower($server['attributes']['name'] ?? '');
                        $description = strtolower($server['attributes']['description'] ?? '');
                        
                        if (strpos($name, 'demo') !== false || strpos($description, 'demo') !== false) {
                            $hasDemo = true;
                            break;
                        }
                    }
                }
            }
            
            // Cache the result for 1 hour
            Cache::put($cacheKey, $hasDemo, 3600);
            
            return $hasDemo;
        } catch (\Exception $e) {
            Log::error("Error checking for demo servers: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Illuminate\Http\Response
     */
    public function handle(Request $request, \Closure $next)
    {
        $this->startTime = microtime(true);
        
        $response = parent::handle($request, $next);
        
        $endTime = microtime(true);
        $executionTime = round(($endTime - $this->startTime) * 1000, 2);
        
        // Log the request timing
        Log::debug("Request processed in {$executionTime}ms", [
            'path' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip()
        ]);
        
        return $response;
    }
}