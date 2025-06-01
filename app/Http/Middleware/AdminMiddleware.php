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
        // Only check admin privileges if the route starts with '/admin'
        if (str_starts_with($request->path(), 'admin')) {
            // Check if the user is authenticated and is an admin
            if (!Auth::check() || !Auth::user()->is_admin) {
                Log::warning('Unauthorized admin access attempt', [
                    'ip' => $request->ip(),
                    'user_id' => Auth::id() ?? 'guest',
                    'path' => $request->path()
                ]);
                
                // Check if this is an API request
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'error' => 'Unauthorized',
                        'message' => 'Admin privileges required'
                    ], 403);
                }
                
                // For regular web requests, redirect to login
                return redirect()->route('login')->with('error', 'Admin privileges required');
            }
        }

        return $next($request);
    }
}