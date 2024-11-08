<?php

// app/Http/Controllers/PasswordResetController.php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    protected $pterodactylService;

    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|confirmed',
            'userId' => 'required|integer',
        ]);

        try {
            $response = $this->pterodactylService->updateUserDetails($request->userId, [
                'password' => $request->password,
            ]);

            Log::info('Password update response:', $response);

            return response()->json(['user' => $response], 200);
        } catch (\Exception $e) {
            Log::error('Password update failed:', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Password update failed.'], 500);
        }
    }
}
