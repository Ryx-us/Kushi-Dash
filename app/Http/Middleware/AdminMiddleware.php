<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Check if the user is authenticated and is an admin
        if (!Auth::check() || !Auth::user()->is_admin) {
            Log::warning('Unauthorized admin access attempt', [
                'ip' => $request->ip(),
                'user_id' => Auth::id() ?? 'guest'
            ]);
            
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Admin privileges required'
            ], 403);
        }

        return $next($request);
    }
}