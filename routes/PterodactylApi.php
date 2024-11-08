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
    Route::put('/pterodactyl/reset-password', [ResetPassword::class, 'resetPassword'])->name('pterodactyl.reset-password');


    Route::match(['get', 'post'], '/pterodactyl/servers/{user_id}', function (Request $request, $user_id) {
            $apiUrl = env('PTERODACTYL_API_URL');
            $apiKey = env('PTERODACTYL_API_KEY');

            // Prepare the command securely
            $command = escapeshellcmd(__DIR__ . '/servers')
                       . ' ' . escapeshellarg($user_id)
                       . ' ' . escapeshellarg($apiUrl)
                       . ' ' . escapeshellarg($apiKey)
                       . ' 2>&1';

            Log::info("Executing command: {$command}");

            // Execute the command and capture the output
            $output = [];
            $return_var = 0;
            exec($command, $output, $return_var);
            Log::info("Command output: " . print_r($output, true));

            // Check for execution errors
            if ($return_var !== 0) {
                $error = [
                    'error' => 'Failed to fetch servers from Pterodactyl.',
                    'details' => implode("\n", $output)
                ];
                Log::error(json_encode($error));
                return response()->json($error, 500);
            }

            // Join the output array into a string and attempt to decode as JSON
            $outputString = implode("\n", $output);
            $servers = json_decode($outputString, true);

            // Check for JSON decoding errors
            if (json_last_error() !== JSON_ERROR_NONE) {
                $error = [
                    'error' => 'Failed to parse server response.',
                    'details' => json_last_error_msg()
                ];
                Log::error(json_encode($error));
                return response()->json($error, 500);
            }

            // Return JSON response based on request method
            if ($request->isMethod('post')) {
                return back()->with([
                    'status' => 'Interisa',
                    'servers' => $servers
                ]);
            }

            return response()->json(['result' => $servers], 200);
        })->name('pterodactyl.get-server-by-user');

    // General route to fetch all servers
    Route::get('/pterodactyl/servers', [ServerController::class, 'getServers'])->name('pterodactyl.get-servers');
});
