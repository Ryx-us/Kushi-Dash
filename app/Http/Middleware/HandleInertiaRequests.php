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

        // Only run this for authenticated users and not on every page load
        // Determine if we're on a resource-intensive route
        $resourceIntensiveRoutes = [
            'dashboard', 'panel', 'deploy', 'plans', 'shop', 'profile'
        ];
        
        $currentRoute = $request->route() ? ($request->route()->getName() ?? '') : '';
        $requiresResources = in_array($currentRoute, $resourceIntensiveRoutes) || 
                             $request->has('refresh_resources');

        // Only process resources for authenticated users on routes that need it
        if ($user && $requiresResources) {
            // Use a long cache time for resources - they rarely change dramatically
            $cacheKey = 'user_resources_' . $user->id;
            $cachedData = Cache::get($cacheKey);
            
            // Check if we need fresh data
            $forceRefresh = $request->has('refresh_resources');
            
            if ($cachedData && !$forceRefresh) {
                // Use cached data - fastest path
                $totalResources = $cachedData['totalResources'];
            } else {
                // No cache or forced refresh - use what we have in the DB for now
                if (!empty($user->resources)) {
                    $totalResources = $user->resources;
                }
                
                // Queue background job to update resources without waiting for it
                if ($user->pterodactyl_id) {
                    // Add jitter to prevent all jobs running at once
                    $jitter = rand(1, 20); 
                    UpdateUserResources::dispatch($user->id)
                        ->onQueue('low')
                        ->delay(now()->addSeconds($jitter));
                }
            }
            
            // For suspension checks, use a separate weekly cache to avoid frequent checks
            $suspensionCacheKey = 'suspension_check_' . $user->id;
            if (!Cache::has($suspensionCacheKey)) {
                SuspendExpiredDemoServers::dispatch($user->id)->onQueue('low');
                // Set a cache so we don't run this too frequently - much longer time
                Cache::put($suspensionCacheKey, true, 86400); // Check once per day
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

        // Only include debug info in development environment
        $debugInfo = [];
        if (config('app.env') !== 'production') {
            $debugInfo = [
                'requestTime' => $executionTime . 'ms',
                'path' => $request->path(),
                'method' => $request->method(),
            ];
        }

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
            'debug' => $debugInfo
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
        
        // Only log timing in development to reduce overhead
        if (config('app.env') !== 'production') {
            $endTime = microtime(true);
            $executionTime = round(($endTime - $this->startTime) * 1000, 2);
            
            Log::debug("Request processed in {$executionTime}ms", [
                'path' => $request->path(),
                'method' => $request->method()
            ]);
        }
        
        return $response;
    }
}