<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ShowConfig extends Command
{
    protected $signature = 'config:show';
    protected $description = 'Display configuration values from the .env file';

    public function handle()
    {
        $configKeys = [
            'APP_URL',
            'COMPANY_NAME',
            'COMPANY_DESC',
            'COMPANY_LOGO_URL',
            'DISCORD_CLIENT_ID',
            'DISCORD_CLIENT_SECRET',
            'DISCORD_REDIRECT_URI',
            'DISCORD_SERVER_ID',
            'DISCORD_BOT_TOKEN',
            'PTERODACTYL_API_URL',
            'PTERODACTYL_API_KEY',
            'INITIAL_CPU',
            'INITIAL_MEMORY',
            'INITIAL_DISK',
            'INITIAL_SERVERS',
            'INITIAL_DATABASES',
            'INITIAL_BACKUPS',
            'INITIAL_ALLOCATIONS',
        ];

        foreach ($configKeys as $key) {
            $this->info("{$key}=" . env($key));
        }

        return 0;
    }
}

