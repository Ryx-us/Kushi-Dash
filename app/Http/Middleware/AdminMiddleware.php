<?php

// File: app/Http/Middleware/AdminMiddleware.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('admin*') && (!Auth::check() || !Auth::user()->is_admin)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
