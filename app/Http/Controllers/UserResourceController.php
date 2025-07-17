<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Jobs\UpdateUserResources;

class UserResourceController extends Controller
{
    public function refreshResources(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Dispatch the job for the authenticated user
        UpdateUserResources::dispatch($user->id);

        return response()->json(['message' => 'Resource refresh requested. Please wait a moment and check your resources.']);
    }
}
