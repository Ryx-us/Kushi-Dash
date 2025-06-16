<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        api: __DIR__.'/../routes/api.php', // Make sure API routes are defined
    )
    
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ShareCompanyName::class,
            \App\Http\Middleware\ApplicationLogoHandler::class,
            \App\Http\Middleware\LandingDescription::class,
            \App\Http\Middleware\User\PassUserData::class,
            \App\Http\Middleware\AdminMiddleware::class,
            \App\Http\Middleware\User\LogUserIp::class,
        ]);
        
        // Register the API middleware group
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ], append: [
            \App\Http\Middleware\ApiProtection::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (! app()->environment(['local', 'testing']) && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    // Return JSON error response for API routes
                    return response()->json([
                        'status' => 'error',
                        'message' => $exception->getMessage() ?: 'An error occurred',
                        'code' => 'server_error',
                    ], $response->getStatusCode());
                }
                
                return Inertia::render('ErrorPage', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 419) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'CSRF token mismatch',
                        'code' => 'csrf_token_mismatch',
                    ], 419);
                }
                
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })
    ->create();