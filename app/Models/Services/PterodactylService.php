<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PterodactylService
{
    protected $panelUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->panelUrl = env('PTERODACTYL_URL');
        $this->apiKey = env('PTERODACTYL_API_KEY');
        $this->CompanyName = env('COMPANY_NAME');
    }

    public function createUser($email, $username, $firstName, $lastName)
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->post("{$this->panelUrl}/api/application/users", [
            'email' => $email,
            'username' => $username,
            'first_name' => $firstName,
            'last_name' => $CompanyName,
        ]);

        return $response->json(); // Return json so It processes it
    }
}
