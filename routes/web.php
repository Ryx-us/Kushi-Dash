<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\DiscordLoginController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\PanelController;
use App\Http\Controllers\PterodactylController;
use App\Http\Controllers\Pterodactyl\ResetPassword;
use App\Http\Controllers\Pterodactyl\ServerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\Pterodactyl\PterodactylEggController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AppSettings;
use App\Http\Controllers\DefaultResources;
use App\Http\Controllers\PterodactylSettingsController;



// Admins shit

Route::middleware(['auth', AdminMiddleware::class])->group(function () {
    Route::get('/admin/eggs/new', [PterodactylEggController::class, 'new'])->name('admin.eggs.new');
    Route::get('/admin/eggs/create', [PterodactylEggController::class, 'create'])->name('admin.eggs.create');
    Route::get('/admin/eggs', [PterodactylEggController::class, 'index'])->name('admin.eggs.index');
    Route::post('/admin/eggs/store', [PterodactylEggController::class, 'store'])->name('admin.eggs.store');
    Route::get('/admin/eggs/{egg}/edit', [PterodactylEggController::class, 'edit'])->name('admin.eggs.edit');
    Route::put('/admin/eggs/update/{egg}', [PterodactylEggController::class, 'update'])->name('admin.eggs.update');
    Route::delete('/admin/eggs/{egg}', [PterodactylEggController::class, 'destroy'])->name('admin.eggs.destroy');
    Route::get('admin/api/logs', [LogController::class, 'getLogs']);
    Route::get('/admin/audit', [PterodactylEggController::class, 'audit']);
    Route::get('/admin/api/users', [UserController::class, 'index']);
    Route::get('admin/api/users/{id}', [UserController::class, 'show']);
    Route::get('/admin/users/{id}/edit', [UserController::class, 'edit']);
    Route::post('/admin/api/users', [UserController::class, 'store']);
    Route::put('/admin/api/users/{id}/update', [UserController::class, 'update']);
    Route::post('/admin/update-env', [AppSettings::class, 'updateEnv']);
    Route::post('/admin/update-env-collection', [AppSettings::class, 'updateEnvCollection']);
    Route::get('/admin/api/get-env', [AppSettings::class, 'getEnv']);
    Route::get('/admin/settings', [DefaultResources::class, 'show']);


    Route::get('/admin/users', function () {
        $users = \App\Models\User::all();
        return Inertia::render('AdminUser', ['users' => $users]);
    });

});



//Public API routes to get normal stuff

Route::get('/client/api/egg/{id}', [PterodactylEggController::class, 'show'])->name('admin.eggs.show');
Route::get('/client/api/pterodactyl/egg/{id}', [PterodactylEggController::class, 'serversshow'])->name('admin.eggs.serversshow');
Route::get('/admin/api/eggs', [PterodactylEggController::class, 'getAllEggs'])->name('admin.eggs.getAllEggs');

//Edit editing
Route::get('/admin/egg/edit/{id}', [PterodactylEggController::class, 'edit'])->name('admin.eggs.edit');



Route::middleware([AdminMiddleware::class])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);

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
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Protected routes requiring authentication
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
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


// Load additional authentication routes
require __DIR__.'/auth.php';
require __DIR__.'/PterodactylApi.php';
