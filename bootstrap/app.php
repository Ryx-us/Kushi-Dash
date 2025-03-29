<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;




return Application::configure(basePath: dirname(__DIR__))
    
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
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
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (NotFoundHttpException $e) {
            return response()->view('404', [], 404);
        });
        
    })
    ->create();