<?php


namespace App\Console\Commands;

use App\Jobs\HandlePlanExpiration;
use App\Models\UserSubscription;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiredPlans extends Command
{
    protected $signature = 'plans:check-expired';
    protected $description = 'Check for expired plans and process them';

    public function handle()
    {
        $this->info('Checking for expired plans...');

        $expiredSubscriptions = UserSubscription::where('status', UserSubscription::STATUS_ACTIVE)
            ->where('expires_at', '<=', Carbon::now())
            ->get();

        $this->info("Found {$expiredSubscriptions->count()} expired plans");

        foreach ($expiredSubscriptions as $subscription) {
            HandlePlanExpiration::dispatch($subscription);
            $this->info("Dispatched expiration job for subscription ID: {$subscription->id}");
        }

        $this->info('Completed checking expired plans');
    }
}