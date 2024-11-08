<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Promise\Utils;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class PterodactylService
{
    protected $apiUrl;
    protected $apiKey;
    protected $client;

    public function __construct()
    {
        $this->apiUrl = env('PTERODACTYL_API_URL');
        $this->apiKey = env('PTERODACTYL_API_KEY');
        $this->client = new Client([
            'base_uri' => $this->apiUrl,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json'
            ]
        ]);
    }

    public function createUser($email, $username, $firstName, $lastName)
    {
        $response = $this->client->postAsync('/api/application/users', [
            'json' => [
                'email' => $email,
                'username' => $username,
                'first_name' => $firstName,
                'last_name' => $lastName
            ]
        ])->wait();

        if ($response->getStatusCode() !== 201) {
            Log::error('Failed to create user on Pterodactyl: ' . $response->getBody());
            throw new \Exception('Failed to create user on Pterodactyl: ' . $response->getBody());
        }

        return json_decode($response->getBody(), true);
    }

    public function getUserDetails($userId)
    {
        $response = $this->client->getAsync("/api/application/users/{$userId}")->wait();

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to fetch user details: ' . $response->getBody());
            throw new \Exception('Failed to fetch user details: ' . $response->getBody());
        }

        return json_decode($response->getBody(), true)['attributes'];
    }



    public function updateUserDetails($userId, $details)
    {
        $userDetails = $this->getUserDetails($userId);

        $updateData = array_merge($userDetails, $details);

        $response = $this->client->patchAsync("/api/application/users/{$userId}", [
            'json' => $updateData
        ])->wait();

        if ($response->getStatusCode() !== 200) {
            Log::error('Failed to update user details: ' . $response->getBody());
            throw new \Exception('Failed to update user details: ' . $response->getBody());
        }

        Log::info('User details updated successfully: ' . $response->getBody());

        return json_decode($response->getBody(), true)['attributes'];
    }
}
