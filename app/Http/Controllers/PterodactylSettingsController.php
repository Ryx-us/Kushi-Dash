<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PterodactylSettingsController extends Controller
{
    public function show()
        {
            // Fetch settings from the database or configuration
            $pterodactylSettings = [
                        'PTERODACTYL_API_URL' => config('services.pterodactyl.url'),
                        'PTERODACTYL_API_KEY' => config('services.pterodactyl.key'),
                    ];

            return [
                'PTERODACTYL_API_URL' => $PTERODACTYL_API_URL,
                'PTERODACTYL_API_KEY' => $PTERODACTYL_API_KEY,
            ];
        }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PTERODACTYL_API_URL' => 'required|url',
            'PTERODACTYL_API_KEY' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors(),
            ], 422);
        }

        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        $envContent = $this->setEnvValue($envContent, 'PTERODACTYL_API_URL', $request->PTERODACTYL_API_URL);
        $envContent = $this->setEnvValue($envContent, 'PTERODACTYL_API_KEY', $request->PTERODACTYL_API_KEY);

        file_put_contents($envPath, $envContent);

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
        ], 200);
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
