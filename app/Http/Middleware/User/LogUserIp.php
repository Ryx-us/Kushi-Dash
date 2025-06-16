<?php


namespace App\Http\Middleware\User;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class LogUserIp
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $ip = $request->ip();
            
            // Skip for local development environments
            if (!in_array($ip, ['127.0.0.1', '::1'])) {
                // Check if the IP is different from the last one
                if ($user->last_ip !== $ip) {
                    // Store the current IP
                    $user->last_ip = $ip;
                    
                    // Update IP history
                    $ipHistory = $user->ip_history ?? [];
                    $ipHistory[] = [
                        'ip' => $ip,
                        'timestamp' => Carbon::now()->toIso8601String(),
                        'user_agent' => $request->userAgent()
                    ];
                    
                    // Keep only the last 10 IP entries
                    if (count($ipHistory) > 10) {
                        $ipHistory = array_slice($ipHistory, -10);
                    }
                    
                    $user->ip_history = $ipHistory;
                    $user->save();
                    
                    // Log IP change
                    Log::info("User IP updated", [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'ip' => $ip,
                        'previous_ip' => $user->getOriginal('last_ip')
                    ]);
                }
                
                // Check if this IP is banned
                if ($user->banned_ip) {
                    Log::warning("Banned IP attempted access", [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'ip' => $ip
                    ]);
                    
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    
                    return redirect()->route('login')
                        ->with('error', 'Your account has been suspended. Please contact support.');
                }
            }
        }
        
        return $next($request);
    }
}