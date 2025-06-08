<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Cache;
use App\Jobs\UpdateUserResources;
use App\Jobs\SuspendExpiredDemoServers;

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

        SuspendExpiredDemoServers::dispatch($user->id);


        if ($user && $user->pterodactyl_id) {
            // Check if we need to refresh the cache or dispatch a background job
            $cacheKey = 'user_resources_' . $user->id;


            
            // Force refresh if requested or if cache doesn't exist
            $forceRefresh = $request->has('refresh_resources') || !Cache::has($cacheKey);
            
            if ($forceRefresh) {
                // Dispatch job to update resources in the background
                UpdateUserResources::dispatch($user->id);
                
                // Log that we're dispatching a job to update resources
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
                    Log::info("Using cached resources for user {$user->id}");
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
                'user' => $user
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
                'cacheHit' => !($request->has('refresh_resources') || !Cache::has('user_resources_' . ($user ? $user->id : 0)))
            ]
        ]);
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