<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Http\Controllers\PterodactylSettingsController;
use Illuminate\Support\Facades\Log;

class DefaultResources extends Controller
{
    public function show()
{
    $envPath = base_path('.env');
    $envContent = file_get_contents($envPath);

    $resources = [];
    foreach (explode("\n", $envContent) as $line) {
        if (preg_match('/^INITIAL_(CPU|MEMORY|DISK|SERVERS|DATABASES|BACKUPS|ALLOCATIONS)=/', $line)) {
            list($key, $value) = explode('=', $line, 2);
            $resources[$key] = $value;
        }
    }

    $pterodactylSettings = [
        'PTERODACTYL_API_URL' => env('PTERODACTYL_API_URL'),
        'PTERODACTYL_API_KEY' => env('PTERODACTYL_API_KEY'),
    ];

    $discordSettings = [
        'DISCORD_CLIENT_ID' => env('DISCORD_CLIENT_ID'),
        'DISCORD_CLIENT_SECRET' => env('DISCORD_CLIENT_SECRET'),
        'DISCORD_REDIRECT_URI' => env('DISCORD_REDIRECT_URI'),
        'DISCORD_SERVER_ID' => env('DISCORD_SERVER_ID'),
        'DISCORD_BOT_TOKEN' => env('DISCORD_BOT_TOKEN'),
    ];

    Log::info('Settings loaded:', ['pterodactyl' => $pterodactylSettings, 'discord' => $discordSettings]);

    return Inertia::render('AdminAppSettings', [
        'resources' => $resources,
        'pterodactylSettings' => $pterodactylSettings,
        'discordSettings' => $discordSettings,
    ]);
}

    public function updateResources(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'INITIAL_CPU' => 'required|integer',
            'INITIAL_MEMORY' => 'required|integer',
            'INITIAL_DISK' => 'required|integer',
            'INITIAL_SERVERS' => 'required|integer',
            'INITIAL_DATABASES' => 'required|integer',
            'INITIAL_BACKUPS' => 'required|integer',
            'INITIAL_ALLOCATIONS' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors(),
            ], 422);
        }

        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        $envContent = $this->setEnvValue($envContent, 'INITIAL_CPU', $request->INITIAL_CPU);
        $envContent = $this->setEnvValue($envContent, 'INITIAL_MEMORY', $request->INITIAL_MEMORY);
        $envContent = $this->setEnvValue($envContent, 'INITIAL_DISK', $request->INITIAL_DISK);
        $envContent = $this->setEnvValue($envContent, 'INITIAL_SERVERS', $request->INITIAL_SERVERS);
        $envContent = $this->setEnvValue($envContent, 'INITIAL_DATABASES', $request->INITIAL_DATABASES);
        $envContent = $this->setEnvValue($envContent, 'INITIAL_BACKUPS', $request->INITIAL_BACKUPS);
        $envContent = $this->setEnvValue($envContent, 'INITIAL_ALLOCATIONS', $request->INITIAL_ALLOCATIONS);

        file_put_contents($envPath, $envContent);

        return back()->with('status', 'success resources');
    }

    private function setEnvValue($envContent, $key, $value)
    {
        $pattern = "/^{$key}=.*/m";
        $replacement = "{$key}={$value}";

        if (preg_match($pattern, $envContent)) {
            $envContent = preg_replace($pattern, $replacement, $envContent);
        } else {
            $envContent .= "\n{$replacement}";
        }

        return $envContent;
    }
}
