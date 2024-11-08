<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class LandingDescription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // load from .env
        $companyDesc = env('COMPANY_DESC', 'Default Company Desciption');


        \Inertia\Inertia::share('companyDesc', $companyDesc);

        return $next($request);
    }
}
