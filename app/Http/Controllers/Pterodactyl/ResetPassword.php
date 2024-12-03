<?php

namespace App\Http\Controllers\Pterodactyl;

use Illuminate\Http\Request;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ResetPassword extends Controller
{
    protected $pterodactylService;

    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
    }

    public function resetPassword(Request $request)
    {
        Log::debug('Reset password endpoint hit', [
            'request_data' => $request->except(['password', 'password_confirmation']),
            'method' => $request->method()
        ]);
    
        // Rest of your code...
        Log::info('Password reset request received', [
            'userId' => $request->userId,
            'has_password' => !empty($request->password),
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        $request->validate([
            'password' => 'required|confirmed',
            'userId' => 'required|integer',
        ]);

        try {
            $response = $this->pterodactylService->updateUserDetails($request->userId, [
                'password' => $request->password,
            ]);

            Log::info('Password reset response:', $response);

            return back()->with('status', 'Password updated successfully.');
        } catch (\Exception $e) {
            Log::error('Password reset failed:', ['error' => $e->getMessage()]);

            return back()->withErrors(['error' => 'Password reset failed.']);
        }
    }
}