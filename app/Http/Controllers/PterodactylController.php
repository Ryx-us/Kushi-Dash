<?php

namespace App\Http\Controllers;

use App\Services\PterodactylService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PterodactylController extends Controller
{
    protected $pterodactylService;

    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'userId' => 'required|integer',
            'password' => 'required|string|confirmed',
        ]);

        $userId = $request->input('userId');
        $password = $request->input('password');

        try {
            $updatedUser = $this->pterodactylService->updateUserDetails($userId, ['password' => $password]);
            return response()->json(['message' => 'Password updated successfully', 'user' => $updatedUser]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
