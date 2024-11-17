<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class EarningController extends Controller
{
    // Display the earning page
    public function earn(Request $request)
    {
        $redeemCode = $request->query('code');

        if ($redeemCode) {
            // Handle the redemption
            $user = Auth::user();

            if (!$user || $user->redeem_code !== $redeemCode) {
                return back()->with('Error', 'Bad code');
            }

            // Clear the redeem code to prevent reuse
            $user->redeem_code = null;

            // Add coins to the user's balance
            $coinReward = env('LINKVERTISE_COIN_REWARD', 100);
            $user->coins += $coinReward;
            $user->save();

            
            return back()->with('success', 'You have earned ' . $coinReward . ' coins!');
        }

        // Log the Linkvertise configuration values directly from .env
        Log::info('Linkvertise Configuration:', [
            'enabled' => env('LINKVERTISE_ENABLED', false),
            'id' => env('LINKVERTISE_ID', 'default_id'),
        ]);

        return Inertia::render('User/Earn', [
            'linkvertiseEnabled' => env('LINKVERTISE_ENABLED', false),
            'linkvertiseId' => env('LINKVERTISE_ID', 'default_id'),
        ]);
    }

    public function generateLinkvertiseLink(Request $request)
{
    if (!env('LINKVERTISE_ENABLED', false)) {
        return redirect()->back()->with('error', 'Linkvertise is not enabled.');
    }

    $user = Auth::user();

    // Generate a unique redeem code
    $redeemCode = Str::random(16);

    // Store the redeem code in the user's model
    $user->redeem_code = $redeemCode;
    $user->save();

    // Generate the domain link
    $domainLink = url('/earn?code=' . urlencode($redeemCode));

    // Generate the Linkvertise URL
    $linkvertiseUrl = $this->generateLinkvertiseUrl($domainLink);

    // Send the link as an Inertia flash message
    return back()->with('linkvertiseUrl', $linkvertiseUrl);
}

    protected function generateLinkvertiseUrl($link)
    {
        $userId = env('LINKVERTISE_ID', 'default_id');
        $randomNumber = random_int(100, 1000);
        $base_url = "https://link-to.net/{$userId}/{$randomNumber}/dynamic";
        $encodedLink = base64_encode(urldecode($link));
        return "{$base_url}?r={$encodedLink}";
    }
}