<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Dotenv\Dotenv;

class DiscordSettingsController extends Controller
{
    public function show()
    {
        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);
        $settings = [];
        
        // Extract values from .env content
        preg_match('/DISCORD_CLIENT_ID=(.*)/', $envContent, $clientId);
        preg_match('/DISCORD_CLIENT_SECRET=(.*)/', $envContent, $clientSecret);
        preg_match('/DISCORD_REDIRECT_URI=(.*)/', $envContent, $redirectUri);
        preg_match('/DISCORD_SERVER_ID=(.*)/', $envContent, $serverId);
        preg_match('/DISCORD_BOT_TOKEN=(.*)/', $envContent, $botToken);

        return Inertia::render('UpdateDiscordSettings', [
            'discordSettings' => [
                'DISCORD_CLIENT_ID' => $clientId[1] ?? '',
                'DISCORD_CLIENT_SECRET' => $clientSecret[1] ?? '',
                'DISCORD_REDIRECT_URI' => $redirectUri[1] ?? '',
                'DISCORD_SERVER_ID' => $serverId[1] ?? '',
                'DISCORD_BOT_TOKEN' => $botToken[1] ?? ''
            ]
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'DISCORD_CLIENT_ID' => 'required|string',
            'DISCORD_CLIENT_SECRET' => 'required|string',
            'DISCORD_REDIRECT_URI' => 'required|url',
            'DISCORD_SERVER_ID' => 'required|string',
            'DISCORD_BOT_TOKEN' => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        foreach ([
            'DISCORD_CLIENT_ID',
            'DISCORD_CLIENT_SECRET',
            'DISCORD_REDIRECT_URI',
            'DISCORD_SERVER_ID',
            'DISCORD_BOT_TOKEN'
        ] as $key) {
            $pattern = "/^{$key}=.*/m";
            $replacement = "{$key}=" . $request->input($key);
            $envContent = preg_replace($pattern, $replacement, $envContent);
        }

        file_put_contents($envPath, $envContent);

        return back()->with(['status' => 'success disocrd', 'message' => 'Discord settings updated successfully']);
    }
}