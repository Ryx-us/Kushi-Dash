<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\PterodactylController;
use App\Http\Controllers\Pterodactyl\ServerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are automatically prefixed with 'api/'
| Laravel automatically prefixes these routes so you don't need to add /api/
| 
*/

// Test route to check API functionality (not protected)
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working correctly',
        'timestamp' => now()->toIso8601String()
    ]);
});

/**
 * Public routes - anyone can access without authentication
 */
Route::prefix('public')->group(function () {
    Route::get('/version', function () {
        return response()->json([
            'version' => '1.0',
            'status' => 'operational'
        ]);
    });
    
    // Move demo check to public for unauthenticated testing
    Route::get('/check-demo-enabled', function () {
        return response()->json(['enabled' => env('DEMO', false)]);
    });
});

// Pterodactyl API routes that should be protected
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/pterodactyl/create-user', [PterodactylController::class, 'createUser']);
    Route::delete('/pterodactyl/delete-user/{id}', [PterodactylController::class, 'deleteUser']);
});

/**
 * Protected Routes - require authentication
 * janky middleware to ensure only authenticated users can access these routes
 * This is where you can add your custom middleware for API protection
 * this uses the web middleware for session access
 */
Route::middleware(['auth:sanctum'])->group(function () {
    // User info endpoint
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::match(['get', 'post'], '/pterodactyl/servers/{user_id}', [ServerController::class, 'getServers'])
        ->name('pterodactyl.get-server-by-user');

    // Client/server endpoints
    Route::get('/client/egg/{id}', [PterodactylEggController::class, 'show'])
        ->name('admin.eggs.show');
        
    Route::get('/client/pterodactyl/egg/{id}', [PterodactylEggController::class, 'serversshow'])
        ->name('admin.eggs.serversshow');
        
    Route::get('/client/plans', [PlanController::class, 'apiIndex'])
        ->name('plans.api.Index');
    
    // Keep the demo check here as well for authenticated users
    Route::get('/check-demo-enabled', function () {
        return response()->json(['enabled' => env('DEMO', false)]);
    });
});