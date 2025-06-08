<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Log\Events\MessageLogged;
use SocialiteProviders\Manager\SocialiteWasCalled;
use SocialiteProviders\Discord\DiscordExtendSocialite;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registration logic if needed
    }

    protected function schedule(Schedule $schedule)
{
    // Update user resources every 15 minutes to keep the cache fresh
    $schedule->call(function () {
        User::whereNotNull('pterodactyl_id')->chunk(20, function ($users) {
            foreach ($users as $user) {
                UpdateUserResources::dispatch($user->id);
                // Add a small delay between jobs to prevent overwhelming the Pterodactyl API
                sleep(1);
            }
        });
    })->everyFifteenMinutes();

    $schedule->command('demo:suspend-expired')->hourly();
}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Event listener for Discord Socialite authentication
        $this->app->make('events')->listen(
            SocialiteWasCalled::class,
            DiscordExtendSocialite::class . '@handle'
        );

        // Discord webhook configuration
        $discordWebState = env('DISCORD_WEB_STATE', false);
        $webhookUrl = env('DISCORD_WEBHOOK_URL');

        if ($discordWebState && $webhookUrl) {
            Log::listen(function (MessageLogged $log) use ($webhookUrl) {
                $rateLimitKey = 'discord-webhook-rate-limit';

                // Rate limiting: Limit to 30 messages per 60 seconds
                if (RateLimiter::tooManyAttempts($rateLimitKey, 30)) {
                    // Rate limit exceeded; skip sending this log
                    return;
                }

                // Record the attempt with a decay time of 60 seconds
                RateLimiter::hit($rateLimitKey, 60);

                // Prepare the message content
                $content = "**{$log->level}**: {$log->message}";

                if (!empty($log->context)) {
                    $content .= "\nContext:\n```json\n" . json_encode($log->context, JSON_PRETTY_PRINT) . "\n```";
                }

                // Send the log message to Discord webhook
                try {
                    Http::post($webhookUrl, [
                        'content' => $content,
                    ]);
                } catch (\Exception $e) {
                    // Handle exception silently to prevent recursion
                    // Optionally, you can log errors to a separate logging channel if needed
                }
            });
        }

        // Share flash messages with Inertia
        Inertia::share([
            'flash' => function () {
                return [
                    'status'         => session('status'),
                    'error'          => session('error'),
                    'res'            => session('res'),
                    'servers'        => session('servers'),
                    'success'        => session('success'),
                    'users'          => session('users'),
                    'server_url'     => session('server_url'),
                    'secerts'        => session('secerts'),
                    'linkvertiseUrl' => session('linkvertiseUrl'),
                ];
            },
        ]);

        // Additional Inertia routes or configurations can be added here
    }
}