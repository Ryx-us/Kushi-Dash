<?php

namespace App\Http\Middleware\User;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PassUserData
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $request->merge([
                'pterodactyl_id' => $user->pterodactyl_id,
                'discord_id' => $user->discord_id,
                'pterodactyl_email' => $user->pterodactyl_email,
                'email' => $user->email,
                'coins' => $user->coins,
                'rank' => $user->rank,
                'resources' => $user->resources,
                'limits' => $user->limits,
                // Coming soon
            ]);
        }

        return $next($request);
    }
}
