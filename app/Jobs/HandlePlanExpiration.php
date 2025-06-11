<?php


namespace App\Jobs;

use App\Models\UserSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class HandlePlanExpiration implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $subscription;

    /**
     * Create a new job instance.
     */
    public function __construct(UserSubscription $subscription)
    {
        $this->subscription = $subscription;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
{
    $subscription = $this->subscription->fresh();
    
    if (!$subscription || $subscription->status !== UserSubscription::STATUS_ACTIVE) {
        return;
    }

    Log::info('Processing subscription expiration', [
        'subscription_id' => $subscription->id,
        'user_id' => $subscription->user_id,
        'plan_id' => $subscription->plan_id,
    ]);

    // Remove plan resources from user
    $this->removePlanFromUser($subscription);

    // Mark subscription as expired
    $subscription->update([
        'status' => UserSubscription::STATUS_EXPIRED
    ]);

    Log::info('Subscription expired and resources removed', [
        'subscription_id' => $subscription->id,
        'user_id' => $subscription->user_id
    ]);
}

    /**
     * Remove plan resources from user.
     */
    private function removePlanFromUser($subscription)
    {
        $user = $subscription->user;
        $plan = $subscription->plan;

        if (!$user || !$plan) {
            return;
        }

        // Remove plan resources from user limits
        $currentLimits = $user->limits ?? [];
        $planResources = $plan->resources ?? [];

        foreach ($planResources as $resourceType => $amount) {
            if (isset($currentLimits[$resourceType])) {
                $currentLimits[$resourceType] = max(0, $currentLimits[$resourceType] - $amount);
            }
        }

        // Remove plan from user's purchased plans
        $purchasesPlans = $user->purchases_plans ?? [];
        $purchasesPlans = array_filter($purchasesPlans, function($planId) use ($subscription) {
            return $planId != $subscription->plan_id;
        });

        $user->update([
            'limits' => $currentLimits,
            'purchases_plans' => array_values($purchasesPlans)
        ]);

        Log::info('Plan removed from user', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'new_limits' => $currentLimits
        ]);
    }
}