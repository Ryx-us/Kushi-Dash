<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;
use SocialiteProviders\Discord\DiscordExtendSocialite;
use Inertia\Inertia;
use App\Services\Admin;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {

    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Setting up the event listener for Discord Socialite
        $this->app->make('events')->listen(
            SocialiteWasCalled::class,
            DiscordExtendSocialite::class.'@handle'
        );

        // Share flash messages with Inertia
        Inertia::share([
            'flash' => function () {
                return [
                    'status' => session('status'),
                    'error' => session('error'),
                    'res' => session('res'),
                    'servers' => session('servers'),
                    'users' => session('users'),
                    'server_url' => session('server_url'),
                    'secerts' => session('secerts'),
                    'linkvertiseUrl' => session('linkvertiseUrl'),
                ];
            },
        ]);
    }
}


//Interia routes Go here Nadhi, Please remember
