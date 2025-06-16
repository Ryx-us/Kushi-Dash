<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class ApiProtection
{
    /**
     * Handle an incoming API request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log headers for debugging (remove in production)
        if (config('app.debug')) {
            Log::debug('API Request', [
                'headers' => $request->headers->all(),
                'has_csrf' => $request->hasHeader('X-CSRF-TOKEN'),
                'has_xsrf' => $request->hasHeader('X-XSRF-TOKEN'),
                'has_bearer' => $request->bearerToken() ? 'yes' : 'no',
                'cookies' => $request->cookies->all(),
                'authenticated' => Auth::check(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);
        }

        // Check for CSRF token for non-GET requests from web-based clients
        // Skip CSRF verification for certain cases
        if (!$this->shouldSkipCsrf($request) && !$this->hasValidCsrfToken($request)) {
            return response()->json([
                'status' => 'error',
                'message' => 'CSRF token mismatch',
                'code' => 'csrf_token_mismatch'
            ], 419);
        }

        // Check authentication for protected routes
        // We'll let Sanctum handle the actual auth check in routes, but
        // this gives us a chance to add more context to unauthorized responses
        if (!$this->shouldAllowUnauthenticated($request) && !$this->isAuthenticated($request)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authentication required for this endpoint',
                'code' => 'unauthenticated',
                'auth_check' => Auth::check(),
                'has_token' => $request->bearerToken() ? true : false,
            ], 401);
        }

        // Add API request log
        if (config('app.env') !== 'testing') {
            $this->logApiRequest($request);
        }

        // Add useful headers to API responses
        return $this->addApiHeaders($next($request));
    }

    /**
     * Check if the user is authenticated via session or token.
     */
    protected function isAuthenticated(Request $request): bool
    {
        // First check for session authentication
        if (Auth::check()) {
            return true;
        }
        
        // Then check for token authentication
        // Note: For this to work, the request needs to go through 
        // Sanctum's auth middleware before reaching here
        if ($request->bearerToken() && Auth::guard('sanctum')->check()) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if the request has a valid CSRF token.
     */
    protected function hasValidCsrfToken(Request $request): bool
    {
        // Standard CSRF token validation
        return $request->hasHeader('X-CSRF-TOKEN') || 
               $request->hasHeader('X-XSRF-TOKEN') || 
               $request->has('_token');
    }

    /**
     * Determine if the request should skip CSRF verification.
     */
    protected function shouldSkipCsrf(Request $request): bool
    {
        // Always skip CSRF for GET, HEAD, OPTIONS requests (they're read-only)
        if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
            return true;
        }
        
        // Skip for testing routes
        if ($request->is('api/test') || $request->is('api/status')) {
            return true;
        }
        
        // Public API endpoints
        if ($request->is('api/public/*')) {
            return true;
        }
        
        // Skip CSRF for token-based authentication
        if ($request->bearerToken()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Determine if the route should allow unauthenticated access.
     */
    protected function shouldAllowUnauthenticated(Request $request): bool
    {
        // Public routes
        if ($request->is('api/public/*')) {
            return true;
        }
        
        // Status and testing routes
        if ($request->is('api/test') || $request->is('api/status')) {
            return true;
        }
        
        // Demo check route
        if ($request->is('api/check-demo-enabled')) {
            return true;
        }
        
        // Login/register routes if they exist in the API
        if ($request->is('api/login') || $request->is('api/register')) {
            return true;
        }
        
        // Add any other public endpoints here
        
        return false;
    }

    /**
     * Log API request for auditing purposes.
     */
    protected function logApiRequest(Request $request): void
    {
        $user = Auth::user();
        
        Log::channel('api')->info('API Request', [
            'user_id' => $user?->id,
            'email' => $user?->email,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'payload' => $this->sanitizePayload($request->all()),
        ]);
    }

    /**
     * Sanitize request payload for logging (remove sensitive data).
     */
    protected function sanitizePayload(array $payload): array
    {
        $sensitiveFields = ['password', 'password_confirmation', 'token', 'api_key', 'secret'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($payload[$field])) {
                $payload[$field] = '[REDACTED]';
            }
        }
        
        return $payload;
    }

    /**
     * Add useful headers to API responses.
     */
    protected function addApiHeaders(Response $response): Response
    {
        // Add API version header
        $response->headers->set('X-API-Version', '1.0');
        
        // Add request ID for debugging
        $response->headers->set('X-Request-ID', uniqid('api-', true));
        
        // Add CORS headers
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-TOKEN, X-XSRF-TOKEN, Authorization');
        
        return $response;
    }
}