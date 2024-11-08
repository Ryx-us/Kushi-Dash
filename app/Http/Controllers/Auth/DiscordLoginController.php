<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class DiscordLoginController extends Controller
{
    protected $pterodactylService;

    public function __construct(PterodactylService $pterodactylService)
    {
        $this->pterodactylService = $pterodactylService;
    }

    public function redirectToDiscord()
    {
        $guildId = env('DISCORD_SERVER_ID');
        $botToken = env('DISCORD_BOT_TOKEN');

        $discordRedirectUrl = Socialite::driver('discord')
            ->with([
                'guild_id' => $guildId,
                'permissions' => '8',
                'response_type' => 'code',
                'scope' => 'identify email guilds.join',
                'client_id' => env('DISCORD_CLIENT_ID'),
                'redirect_uri' => env('DISCORD_REDIRECT_URI'),
                'prompt' => 'consent',
                'bot_token' => $botToken
            ])
            ->redirect()
            ->getTargetUrl();

        return redirect($discordRedirectUrl);
    }

    public function handleDiscordCallback()
    {
        $discordUser = Socialite::driver('discord')->user();

        // Check if the user already exists in the database
        $user = User::where('discord_id', $discordUser->getId())->first();

        if (!$user) {
            // Attempt to create a Pterodactyl user with the Discord user information
            $pterodactylUser = $this->pterodactylService->createUser(
                $discordUser->getEmail(),
                $discordUser->getNickname(),
                $discordUser->getName(),
                'User' // Default last name, modify as needed
            );

            // Check if the Pterodactyl user creation was successful and contains required attributes
            if (!isset($pterodactylUser['attributes']['id'])) {
                abort(500, 'Failed to create user on Pterodactyl');
            }

            // Extract relevant data from the Pterodactyl API response
            $pterodactylId = $pterodactylUser['attributes']['id'];
            $pterodactylEmail = $pterodactylUser['attributes']['email'];

            // Create or update the local user with Discord and Pterodactyl info
            $user = User::updateOrCreate(
                ['discord_id' => $discordUser->getId()],
                [
                    'name' => $discordUser->getName(),
                    'email' => $discordUser->getEmail() ?? $this->generateUniqueEmail($discordUser->getId()),
                    'password' => Hash::make(Str::random(24)), // Generates a random password for the user
                    'pterodactyl_id' => $pterodactylId,
                    'pterodactyl_email' => $pterodactylEmail,
                ]
            );
        }

        Auth::login($user, true);

        return redirect()->route('dashboard');
    }

    protected function generateUniqueEmail($discordId)
    {
        return "discorduser_{$discordId}@example.com";
    }
}
