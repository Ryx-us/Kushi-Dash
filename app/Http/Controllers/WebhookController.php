<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle Tebex webhook and forward to Discord.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function handleTebexWebhook(Request $request)
    {
        // Log the incoming webhook for debugging
        Log::info('Received Tebex Webhook:', $request->all());
        $signature = $request->header('X-Tebex-Signature');

    // Generate hash using secret and request payload
    $hash = hash_hmac('sha256', $request->getContent(), env('TEBEX_WEBHOOK_SECRET'));

    if (!hash_equals($hash, $signature)) {
        Log::warning('Invalid Tebex webhook signature.');
        return response()->json(['status' => 'invalid signature'], 400);
    }

        // Prepare the message for Discord
        $discordMessage = [
            'content' => "🛒 **Tebex Webhook Received**\n" . json_encode($request->all(), JSON_PRETTY_PRINT),
        ];

        try {
            // Send the data to Discord webhook
            $response = Http::post(config('services.discord.webhook_url'), $discordMessage);

            if ($response->successful()) {
                Log::info('Successfully forwarded Tebex webhook to Discord.');
                return response()->json(['status' => 'success'], 200);
            } else {
                Log::error('Failed to send data to Discord webhook.', ['response' => $response->body()]);
                return response()->json(['status' => 'error', 'message' => 'Failed to send data to Discord.'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Exception while forwarding to Discord webhook: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Exception occurred.'], 500);
        }
    }
}