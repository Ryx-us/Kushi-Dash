<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Http\Controllers\Auth\DiscordLoginController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\PanelController;
use App\Http\Controllers\PterodactylController;
use App\Http\Controllers\Pterodactyl\ResetPassword;
use App\Http\Controllers\Pterodactyl\ServerController;
use Illuminate\Http\Request;

use App\Http\Middleware\AdminMiddleware;
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






Route::post('/payment/api/webhook', [WebhookController::class, 'handleTebexWebhook'])->name('webhooks.tebex');

// Admins shit

Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    Route::get('/admin/eggs/new', [PterodactylEggController::class, 'new'])->name('admin.eggs.new');
    Route::get('/admin/eggs/create', [PterodactylEggController::class, 'create'])->name('admin.eggs.create');
    Route::get('/admin/eggs', [PterodactylEggController::class, 'index'])->name('admin.eggs.index');
    Route::post('/admin/eggs/store', [PterodactylEggController::class, 'store'])->name('admin.eggs.store');
    Route::get('/admin/egg/edit/{egg}', [PterodactylEggController::class, 'edit'])->name('admin.eggs.edit');
    Route::put('/admin/eggs/update/{egg}', [PterodactylEggController::class, 'update'])->name('admin.eggs.update');
    Route::delete('/admin/api/eggs/{egg}', [PterodactylEggController::class, 'destroy'])->name('admin.eggs.destroy');
    Route::get('admin/api/logs', [LogController::class, 'getLogs']);
    Route::get('/admin/audit', [PterodactylEggController::class, 'audit']);
    Route::get('/admin/api/users', [UserController::class, 'index']);
    Route::get('admin/api/users/{id}', [UserController::class, 'show']);
    Route::get('/admin/users/{id}/edit', [UserController::class, 'edit']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy'])
    ->name('admin.users.destroy');
    Route::post('/admin/api/users', [UserController::class, 'store']);
    Route::get('/admin/eggs/info/{id}', [PterodactylEggController::class, 'getEggInfo'])->name('admin.eggs.info');
    Route::put('/admin/api/users/{id}/update', [UserController::class, 'update']);
    Route::post('/admin/update-env', [AppSettings::class, 'updateEnv']);
    Route::post('/admin/update-env-collection', [AppSettings::class, 'updateEnvCollection']);
    Route::get('/admin/api/get-env', [AppSettings::class, 'getEnv']);
    Route::get('/admin/settings', [DefaultResources::class, 'show']);
    
    Route::get('/deploy', [ServerController::class, 'create'])->name('servers.create');
    Route::post('/servers', [ServerController::class, 'store'])->name('servers.store');

    Route::get('/cdn/storage/blob/{filename}', [CDNController::class, 'serveFile'])->name('cdn.serve');

    Route::get('/server/{any?}', function () {
        // Get dynamic data from DataStoreController
       
        
        return view('wrapper', );
    })->where('any', '.*');

    
    

    
    

    // Stupid shit

    Route::get('/admin/api/locations', [LocationController::class, 'index'])->name('locations.index');
    Route::get('/admin/locations', [LocationController::class, 'Viewindex'])->name('locations.Viewindex');
    Route::get('/admin/locations/new', [LocationController::class, 'Viewcreate'])->name('locations.Viewcreate');
    Route::post('/admin/api/locations', [LocationController::class, 'store'])->name('locations.store');
    
    Route::delete('/admin/api/locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');
    Route::get('/admin/locations/edit/{locationId}', [LocationController::class, 'Viewedit'])
        ->name('locations.Viewedit');

    // Handle the update request
    Route::put('/admin/locations/{locationId}', [LocationController::class, 'update'])
        ->name('locations.update');


    Route::get('/admin/users', function () {
        $users = \App\Models\User::all();
        return Inertia::render('AdminUser', ['users' => $users]);
    });

});
// Plans Routes

Route::get('/admin/api/locations', [LocationController::class, 'index'])->name('locations.index');

Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    
    Route::get('/admin/plans/new', [PlanController::class, 'create'])->name('plans.create');
    Route::get('/admin/plans', [PlanController::class, 'index'])->name('plans.index');
    Route::get('/admin/plans/create', [PlanController::class, 'create'])->name('plans.create');
    Route::post('/admin/plans/store', [PlanController::class, 'store'])->name('plans.store');
    Route::get('/admin/plans/{plan}/edit', [PlanController::class, 'edit'])->name('plans.edit');
    Route::put('/admin/plans/{plan}', [PlanController::class, 'update'])->name('plans.update');
    Route::delete('/admin/plans/{plan}', [PlanController::class, 'destroy'])->name('admin.plans.destroy');
    Route::get('/admin/api/plans', [PlanController::class, 'apiIndex'])->name('plans.api.Index');
    Route::post('/server/{serverId}/update', [ServerController::class, 'update'])->name('server.update');

    
});


//Public API routes to get normal stuff

Route::get('/client/api/egg/{id}', [PterodactylEggController::class, 'show'])->name('admin.eggs.show');
Route::get('/client/api/pterodactyl/egg/{id}', [PterodactylEggController::class, 'serversshow'])->name('admin.eggs.serversshow');
Route::get('/admin/api/eggs', [PterodactylEggController::class, 'getAllEggs'])->name('admin.eggs.getAllEggs');

//Edit editing




Route::middleware([AdminMiddleware::class])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);

    Route::get('/admin/cdn', [CDNController::class, 'index'])->name('cdn.index');
    Route::post('/cdn/upload', [CDNController::class, 'store'])->name('cdn.store');
    Route::delete('/cdn/{filename}', [CDNController::class, 'destroy'])->name('cdn.destroy');

    // Other admin routes





});

Route::middleware([AdminMiddleware::class])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    // Other admin routes
});

// Pterodactyl API routes


// Public routes
Route::middleware('auth')->group(function () {
    Route::get('/panel', [PanelController::class, 'index'])->name('panel.index');
});

// Main landing page redirecting based on authentication status
Route::get('/', function () {
    return Auth::check() ? redirect('/dashboard') : redirect('/login');
});

// Discord login routes
Route::middleware(['web'])->group(function () {
    Route::get('auth/discord', [DiscordLoginController::class, 'redirectToDiscord']);
    Route::get('auth/discord/callback', [DiscordLoginController::class, 'handleDiscordCallback']);
});

// Dashboard route, accessible only to authenticated users
Route::get('/dashboard', function () {
    $start = microtime(true);

    // Prepare data here if any
    $response = Inertia::render('Dashboard');

    $duration = microtime(true) - $start;
    Log::info("Dashboard data prep took: {$duration} seconds");

    return $response;
})->middleware(['auth', 'verified'])->name('dashboard');

// Protected routes requiring authentication
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/plans', [PlanController::class, 'Userindex'])->name('plans.Userindex');
    Route::get('client/api/users/{id}', [UserController::class, 'showClient']);
    Route::get('/shop', [PlanController::class, 'Userindexcoins'])->name('plans.Userindexcoins');
});

Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('AdminDashboard');
    })->name('admin.dashboard');
});


// App settings Machine
Route::middleware(['auth', AdminMiddleware::class])->group(function () {

    Route::post('/admin/api/ups', [DefaultResources::class, 'updateResources']);
});

Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    Route::get('/admin/api/get-pterodactyl-settings', [PterodactylSettingsController::class, 'show']);
    Route::post('/admin/api/update-pterodactyl-settings', [PterodactylSettingsController::class, 'update']);
});


Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    Route::get('/admin/discord-settings', [DiscordSettingsController::class, 'show'])->name('discord.settings');
    Route::post('/admin/api/update-discord-settings', [DiscordSettingsController::class, 'update'])->name('discord.settings.update');
});




Route::middleware(['auth'])->group(function () {
    Route::get('/earn', [EarningController::class, 'earn'])->name('earn');
    
    

    Route::post('/generate-linkvertise', [EarningController::class, 'generateLinkvertiseLink'])->name('generate.linkvertise');
    Route::post('/shop/purchase', [UserController::class, 'purchaseResource']);

    Route::get('/dashboard/servers/edit/{serverId}', [ServerController::class, 'edit'])->name('server.edit');
    Route::get('/user/plans/purchase/{planId}', [PlanController::class, 'purchase'])
    ->name('plans.purchase');
    
});

Route::get('checkout', function (Request $request) {
        // Capture referrer information from different sources
        $referrer = null;
        
        // 1. Check URL parameter 'ref'
        if ($request->has('ref')) {
            $referrer = $request->query('ref');
        }
        // 2. Check URL parameter 'utm_source'
        else if ($request->has('utm_source')) {
            $referrer = $request->query('utm_source');
        }
        // 3. Check URL parameter 'source'
        else if ($request->has('source')) {
            $referrer = $request->query('source');
        }
        // 4. Check HTTP referrer header
        else if ($request->headers->has('referer')) {
            // Extract domain from referer URL
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
        
        // Check if referrer is from a known affiliate/partner
        $isAffiliate = false;
        if ($referrer) {
            $isAffiliate = str_contains(strtolower($referrer), 'linkvertise.com') || 
                          str_contains(strtolower($referrer), 'aff') || 
                          str_contains(strtolower($referrer), 'affiliate') ||
                          str_contains(strtolower($referrer), 'partner');
                          
            // Log the referrer for analytics
            Log::info('Checkout referrer detected', [
                'referrer' => $referrer,
                'isAffiliate' => $isAffiliate,
                'user_id' => auth()->id(),
                'url' => $request->fullUrl()
            ]);
        }
        
        // Pass referrer information to the component
        return Inertia::render('Checkout/Page', [
            'referrerInfo' => [
                'domain' => $referrer,
                'isAffiliate' => $isAffiliate
            ]
        ]);
    })->name('checkout.success');

    
Route::get('/admin/api/locations/{location}', [LocationController::class, 'show'])->name('locations.show');
Route::get('/client/api/plans', [PlanController::class, 'apiIndex'])->name('plans.api.Index');

// Load additional authentication routes
require __DIR__.'/auth.php';
require __DIR__.'/PterodactylApi.php';

// Image libs https://iconscout.com/illustrations/empty

