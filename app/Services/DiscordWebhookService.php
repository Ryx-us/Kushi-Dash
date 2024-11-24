<?php
// app/Services/DiscordWebhookService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscordWebhookService
{
    protected $webhookUrl;
    protected $enabled;

    public function __construct()
    {
        $this->webhookUrl = config('services.discord.webhook_url');
        $this->enabled = config('services.discord.web_state');
    }

    public function send($message)
    {
        if (!$this->enabled) {
            return false;
        }

        try {
            $response = Http::post($this->webhookUrl, [
                'content' => $message
            ]);
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Discord webhook failed: ' . $e->getMessage());
            return false;
        }
    }
}