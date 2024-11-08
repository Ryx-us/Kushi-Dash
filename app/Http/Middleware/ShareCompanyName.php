<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ShareCompanyName
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
        // Assuming you have the company name in the .env file
        $companyName = env('COMPANY_NAME', 'Default Company Name');

        // Share the company name with the view or response
        // This assumes you're using Inertia.js with Laravel
        // You can use the following line to share it across all responses
        \Inertia\Inertia::share('companyName', $companyName);

        return $next($request);
    }
}
