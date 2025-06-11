<?php


use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\DiscordLoginController;
use App\Http\Controllers\PanelController;
use App\Http\Controllers\Pterodactyl\ServerController;
use App\Http\Controllers\Pterodactyl\PterodactylEggController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AppSettings;
use App\Http\Controllers\DefaultResources;
use App\Http\Controllers\PterodactylSettingsController;
use App\Http\Controllers\DiscordSettingsController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\EarningController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\CDNController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Main landing page route
 */
Route::get('/', function () {
    try {
        return Auth::check() ? redirect('/dashboard') : redirect('/login');
    } catch (\Exception $e) {
        \Log::error('Error in root route: ' . $e->getMessage());
        return redirect('/login');
    }
});

/**
 * Authentication routes
 */
Route::middleware(['web'])->group(function () {
    Route::get('auth/discord', [DiscordLoginController::class, 'redirectToDiscord']);
    Route::get('auth/discord/callback', [DiscordLoginController::class, 'handleDiscordCallback']);
});

require __DIR__.'/auth.php';

/**
 * Dashboard and user area routes
 */
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $start = microtime(true);
        $response = Inertia::render('Dashboard');
        $duration = microtime(true) - $start;
        Log::info("Dashboard data prep took: {$duration} seconds");
        return $response;
    })->name('dashboard');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::get('/panel', [PanelController::class, 'index'])->name('panel.index');
    Route::get('/plans', [PlanController::class, 'Userindex'])->name('plans.Userindex');
    Route::get('/shop', [PlanController::class, 'Userindexcoins'])->name('plans.Userindexcoins');
    Route::get('/earn', [EarningController::class, 'earn'])->name('earn');
    Route::get('/user/plans/purchase/{planId}', [PlanController::class, 'purchase'])->name('plans.purchase');
    Route::get('/dashboard/servers/edit/{serverId}', [ServerController::class, 'edit'])->name('server.edit');
    
    Route::post('/generate-linkvertise', [EarningController::class, 'generateLinkvertiseLink'])->name('generate.linkvertise');
    Route::post('/shop/purchase', [UserController::class, 'purchaseResource']);
    
    Route::get('client/api/users/{id}', [UserController::class, 'showClient']);
    Route::get('broadcast/india', function () {
        return Inertia::render('Broadcast/Page');
    })->name('broadcast.1');
});

/**
 * Checkout route
 */
Route::get('checkout', function (Request $request) {
    $referrer = null;
    
    if ($request->has('ref')) {
        $referrer = $request->query('ref');
    } elseif ($request->has('utm_source')) {
        $referrer = $request->query('utm_source');
    } elseif ($request->has('source')) {
        $referrer = $request->query('source');
    } elseif ($request->headers->has('referer')) {
        $refererUrl = $request->headers->get('referer');
        try {
            $parsedUrl = parse_url($refererUrl);
            if (isset($parsedUrl['host'])) {
                $referrer = $parsedUrl['host'];
            }
        } catch (\Exception $e) {
            Log::error('Failed to parse referrer URL: ' . $refererUrl);
        }
    }
    
    $isAffiliate = false;
    if ($referrer) {
        $isAffiliate = str_contains(strtolower($referrer), 'linkvertise.com') || 
                      str_contains(strtolower($referrer), 'aff') || 
                      str_contains(strtolower($referrer), 'affiliate') ||
                      str_contains(strtolower($referrer), 'partner');
                      
        Log::info('Checkout referrer detected', [
            'referrer' => $referrer,
            'isAffiliate' => $isAffiliate,
            'user_id' => auth()->id(),
            'url' => $request->fullUrl()
        ]);
    }
    
    return Inertia::render('Checkout/Page', [
        'referrerInfo' => [
            'domain' => $referrer,
            'isAffiliate' => $isAffiliate
        ]
    ]);
})->name('checkout.success');

/**
 * Public API routes
 */
Route::get('/client/api/egg/{id}', [PterodactylEggController::class, 'show'])->name('admin.eggs.show');
Route::get('/client/api/pterodactyl/egg/{id}', [PterodactylEggController::class, 'serversshow'])->name('admin.eggs.serversshow');
Route::get('/client/api/plans', [PlanController::class, 'apiIndex'])->name('plans.api.Index');
Route::get('api/check-demo-enabled', function () {
    return response()->json(['enabled' => env('DEMO', false)]);
});

/**
 * Payment webhook routes
 */
Route::post('/payment/api/webhook', [WebhookController::class, 'handleTebexWebhook'])->name('webhooks.tebex');

/**
 * Admin routes
 */
Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    // Dashboard
    Route::get('/admin', function () {
        return Inertia::render('AdminDashboard');
    })->name('admin.dashboard');
    
    // User management
    Route::get('/admin/users', function () {
        $users = \App\Models\User::all();
        return Inertia::render('AdminUser', ['users' => $users]);
    });
    Route::get('/admin/api/users', [UserController::class, 'index']);
    Route::get('admin/api/users/{id}', [UserController::class, 'show']);
    Route::get('/admin/users/{id}/edit', [UserController::class, 'edit']);
    Route::post('/admin/api/users', [UserController::class, 'store']);
    Route::put('/admin/api/users/{id}/update', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    
    // Egg management
    Route::get('/admin/eggs/new', [PterodactylEggController::class, 'new'])->name('admin.eggs.new');
    Route::get('/admin/eggs/create', [PterodactylEggController::class, 'create'])->name('admin.eggs.create');
    Route::get('/admin/eggs', [PterodactylEggController::class, 'index'])->name('admin.eggs.index');
    Route::get('/admin/egg/edit/{egg}', [PterodactylEggController::class, 'edit'])->name('admin.eggs.edit');
    Route::get('/admin/eggs/info/{id}', [PterodactylEggController::class, 'getEggInfo'])->name('admin.eggs.info');
    Route::get('/admin/api/eggs', [PterodactylEggController::class, 'getAllEggs'])->name('admin.eggs.getAllEggs');
    Route::post('/admin/eggs/store', [PterodactylEggController::class, 'store'])->name('admin.eggs.store');
    Route::put('/admin/eggs/update/{egg}', [PterodactylEggController::class, 'update'])->name('admin.eggs.update');
    Route::delete('/admin/api/eggs/{egg}', [PterodactylEggController::class, 'destroy'])->name('admin.eggs.destroy');
    Route::get('/admin/audit', [PterodactylEggController::class, 'audit']);
    
    // Location management
    Route::get('/admin/locations', [LocationController::class, 'Viewindex'])->name('locations.Viewindex');
    Route::get('/admin/locations/new', [LocationController::class, 'Viewcreate'])->name('locations.Viewcreate');
    Route::get('/admin/locations/edit/{locationId}', [LocationController::class, 'Viewedit'])->name('locations.Viewedit');
    Route::get('/admin/api/locations', [LocationController::class, 'index'])->name('locations.index');
    Route::get('/admin/api/locations/{location}', [LocationController::class, 'show'])->name('locations.show');
    Route::post('/admin/api/locations', [LocationController::class, 'store'])->name('locations.store');
    Route::put('/admin/locations/{locationId}', [LocationController::class, 'update'])->name('locations.update');
    Route::delete('/admin/api/locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');
    
    // Plans management
    Route::get('/admin/plans', [PlanController::class, 'index'])->name('plans.index');
    Route::get('/admin/plans/new', [PlanController::class, 'create'])->name('plans.create');
    Route::get('/admin/plans/create', [PlanController::class, 'create'])->name('plans.create');
    Route::get('/admin/plans/{plan}/edit', [PlanController::class, 'edit'])->name('plans.edit');
    Route::get('/admin/api/plans', [PlanController::class, 'apiIndex'])->name('plans.api.Index');
    Route::post('/admin/plans/store', [PlanController::class, 'store'])->name('plans.store');
    Route::put('/admin/plans/{plan}', [PlanController::class, 'update'])->name('plans.update');
    Route::delete('/admin/plans/{plan}', [PlanController::class, 'destroy'])->name('admin.plans.destroy');
    
    // Server management
    Route::get('/deploy', [ServerController::class, 'create'])->name('servers.create');
    Route::post('/servers', [ServerController::class, 'store'])->name('servers.store');
    Route::post('/server/{serverId}/update', [ServerController::class, 'update'])->name('server.update');
    Route::get('/server/{any?}', function () {
        return view('wrapper');
    })->where('any', '.*');
    
    // Settings
    Route::get('/admin/settings', [DefaultResources::class, 'show']);
    Route::get('/admin/api/get-env', [AppSettings::class, 'getEnv']);
    Route::post('/admin/update-env', [AppSettings::class, 'updateEnv']);
    Route::post('/admin/update-env-collection', [AppSettings::class, 'updateEnvCollection']);
    Route::post('/admin/api/ups', [DefaultResources::class, 'updateResources']);
    
    // Pterodactyl settings
    Route::get('/admin/api/get-pterodactyl-settings', [PterodactylSettingsController::class, 'show']);
    Route::post('/admin/api/update-pterodactyl-settings', [PterodactylSettingsController::class, 'update']);
    
    // Discord settings
    Route::get('/admin/discord-settings', [DiscordSettingsController::class, 'show'])->name('discord.settings');
    Route::post('/admin/api/update-discord-settings', [DiscordSettingsController::class, 'update'])->name('discord.settings.update');
    
    // Logs
    Route::get('admin/api/logs', [LogController::class, 'getLogs']);
    
    // CDN management
    Route::get('/admin/cdn', [CDNController::class, 'index'])->name('cdn.index');
    Route::post('/cdn/upload', [CDNController::class, 'store'])->name('cdn.store');
    Route::delete('/cdn/{filename}', [CDNController::class, 'destroy'])->name('cdn.destroy');
    Route::get('/cdn/storage/blob/{filename}', [CDNController::class, 'serveFile'])->name('cdn.serve');
});

/**
 * Pterodactyl API routes
 */
require __DIR__.'/PterodactylApi.php';