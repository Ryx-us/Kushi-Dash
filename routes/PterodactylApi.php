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



Route::middleware('auth')->group(function () {
    Route::match(['get', 'post'], '/pterodactyl/servers/{user_id}', [ServerController::class, 'getServers'])
    ->name('pterodactyl.get-server-by-user');

    Route::delete('/pterodactyl/servers/{server_id}/delete', [ServerController::class, 'deleteServer'])
    ->name('pterodactyl.servers.delete');

// Keep the general servers route
Route::get('/pterodactyl/servers', [ServerController::class, 'getServers'])
    ->name('pterodactyl.get-servers');
    Route::post('/pterodactyl/servers', [ServerController::class, 'getServers'])
    ->name('pterodactyl.get-servers');
});
