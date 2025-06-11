<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PlanController extends Controller
{
    /**
     * Display a listing of the plans.
     */
    public function index()
    {
        $plans = Plan::all();
        return Inertia::render('AdminPlans', ['plans' => $plans]);
    }

    public function Userindexcoins()
    {
        try {
            $plans = Plan::where('visibility', true)->get();
            
            Log::info('Fetched plans:', [
                'count' => $plans->count(),
                'plans' => $plans->toArray()
            ]);

            return Inertia::render('User/CoinShop', [
                'plans' => $plans,
                'debug' => app()->environment('local', 'staging')
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching plans: ' . $e->getMessage());
            return Inertia::render('User/CoinShop', [
                'plans' => [],
                'error' => 'Failed to load plans'
            ]);
        }
    }

    public function Userindex()
    {
        try {
            $plans = Plan::where('visibility', true)->get();
            
            Log::info('Fetched plans:', [
                'count' => $plans->count(),
                'plans' => $plans->toArray()
            ]);

            return Inertia::render('User/Products', [
                'plans' => $plans,
                'debug' => app()->environment('local', 'staging')
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching plans: ' . $e->getMessage());
            return Inertia::render('User/Products', [
                'plans' => [],
                'error' => 'Failed to load plans'
            ]);
        }
    }

    /**
     * Show the form for creating a new plan.
     */
    public function create()
    {
        $plans = Plan::all();
        return Inertia::render('AdminPlanCreate', ['plans' => $plans]);
    }

    
/**
 * Store a newly created plan in storage.
 */
public function store(Request $request)
{
    $validatedData = $this->validateRequest($request);

    // Convert resource_plans to resources for database storage
    if (isset($validatedData['resource_plans'])) {
        $validatedData['resources'] = $validatedData['resource_plans'];
        unset($validatedData['resource_plans']); // Remove the original key
    }

    $defaultValues = [
        'name' => null,
        'price' => 0,
        'features' => null,
        'icon' => null,
        'image' => null,
        'description' => null,
        'resources' => [
            'cpu' => 0,
            'memory' => 0,
            'disk' => 0,
            'databases' => 0,
            'allocations' => 0,
            'backups' => 0,
            'servers' => 0,
        ],
        'discount' => 0,
        'visibility' => true,
        'redirect' => null,
        'perCustomer' => 1,
        'planType' => 'monthly',
        'perPerson' => 0,
        'stock' => 0,
        'kushiConfig' => null,
        'maxUsers' => 1,
        'duration' => $this->getDefaultDuration($validatedData['planType'] ?? 'monthly'),
    ];

    $dataToStore = array_merge($defaultValues, $validatedData);

    Log::info('Creating plan with data:', $dataToStore);

    try {
        $plan = Plan::create($dataToStore);
        Log::info('Plan created successfully:', ['plan' => $plan->toArray()]);
        
        return redirect()->route('plans.index')->with('success', 'Plan created successfully.');
    } catch (\Exception $e) {
        Log::error('Failed to create plan: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        return redirect()->back()->with('error', 'Failed to create plan: ' . $e->getMessage());
    }
}

/**
 * Validate the request data.
 */
protected function validateRequest(Request $request)
{
    return $request->validate([
        'name' => 'required|string|max:255',
        'price' => 'nullable|numeric|min:0',
        'icon' => 'nullable|string',
        'image' => 'nullable|string',
        'description' => 'required|string|max:65535',
        'resource_plans' => 'nullable|array', // Changed from 'resources' to 'resource_plans'
        'resource_plans.cpu' => 'nullable|integer|min:0',
        'resource_plans.memory' => 'nullable|integer|min:0',
        'resource_plans.disk' => 'nullable|integer|min:0',
        'resource_plans.databases' => 'nullable|integer|min:0',
        'resource_plans.allocations' => 'nullable|integer|min:0',
        'resource_plans.backups' => 'nullable|integer|min:0',
        'resource_plans.servers' => 'nullable|integer|min:0',
        'discount' => 'nullable|numeric|min:0',
        'visibility' => 'boolean',
        'redirect' => 'nullable|string',
        'planType' => 'required|in:monthly,annual,onetime',
        'maxUsers' => 'nullable|integer|min:1',
        'stock' => 'nullable|integer|min:0',
        'duration' => 'nullable|integer|min:0',
    ]);
}

    /**
     * Show the form for editing the specified plan.
     */
    public function edit(Plan $plan)
    {
        return Inertia::render('AdminPlanEdit', [
            'plan' => $plan
        ]);
    }

    /**
     * Handle the purchase of a plan.
     */
    public function purchase(Request $request, $planId)
    {
        $plan = Plan::find($planId);

        if (!$plan) {
            return redirect()->back()->withErrors(['error' => 'Plan not found.']);
        }

        // Check if the plan has a redirect URL
        if ($plan->redirect && filter_var($plan->redirect, FILTER_VALIDATE_URL)) {
            Log::info("Redirecting user to external URL for plan ID: {$planId}");
            return redirect()->away($plan->redirect);
        }

        // Continue with purchase process
        try {
            $user = $request->user();

            // Create subscription for monthly/annual plans
            if (in_array($plan->planType, ['monthly', 'annual'])) {
                $this->createSubscription($user, $plan);
            } else {
                // For onetime plans, just give resources immediately
                $this->giveOneTimeResources($user, $plan);
            }

            Log::info("User ID {$user->id} purchased plan ID {$planId}");

            return redirect()->route('dashboard')->with('success', 'Plan purchased successfully.');
        } catch (\Exception $e) {
            Log::error("Purchase failed for plan ID {$planId}: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to purchase the plan. Please try again.']);
        }
    }

    /**
     * Update the specified plan in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        $validatedData = $this->validateRequest($request);

        try {
            $plan->update($validatedData);
            return redirect()->route('plans.index')->with('success', 'Plan updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update plan: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update plan.');
        }
    }

    /**
     * Remove the specified plan from storage.
     */
    public function destroy(Plan $plan)
    {
        try {
            $plan->delete();
            return redirect()->route('plans.index')->with('success', 'Plan deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete plan: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete plan.');
        }
    }

    /**
     * Display all plans in JSON format for API.
     */
    public function apiIndex()
    {
        try {
            $plans = Plan::where('visibility', true)->get();
            return response()->json([
                'statusCode' => 200,
                'message' => 'Plans retrieved successfully',
                'error' => null,
                'plans' => $plans
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch plans: ' . $e->getMessage());
            return response()->json([
                'statusCode' => 500, 
                'message' => 'Failed to fetch plans',
                'error' => $e->getMessage(),
                'plans' => null
            ], 500);
        }
    }

    /**
     * Get current active subscriptions API
     */
    public function apiSubscriptions()
    {
        try {
            $subscriptions = UserSubscription::with(['user', 'plan'])
                ->where('status', 'active')
                ->get()
                ->map(function ($subscription) {
                    return [
                        'id' => $subscription->id,
                        'user' => [
                            'id' => $subscription->user->id,
                            'name' => $subscription->user->name,
                            'email' => $subscription->user->email,
                        ],
                        'plan' => [
                            'id' => $subscription->plan->id,
                            'name' => $subscription->plan->name,
                            'planType' => $subscription->plan->planType,
                        ],
                        'status' => $subscription->status,
                        'expires_at' => $subscription->expires_at,
                        'created_at' => $subscription->created_at,
                        'days_remaining' => $subscription->expires_at ? 
                            Carbon::now()->diffInDays($subscription->expires_at, false) : null,
                    ];
                });

            return response()->json([
                'statusCode' => 200,
                'message' => 'Subscriptions retrieved successfully',
                'subscriptions' => $subscriptions,
                'total' => $subscriptions->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch subscriptions: ' . $e->getMessage());
            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to fetch subscriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create subscription for recurring plans
     */
    private function createSubscription($user, $plan)
    {
        $expiresAt = null;
        
        if ($plan->planType === 'monthly') {
            $expiresAt = Carbon::now()->addMonth();
        } elseif ($plan->planType === 'annual') {
            $expiresAt = Carbon::now()->addYear();
        }

        UserSubscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'expires_at' => $expiresAt,
        ]);

        // Give resources immediately
        $this->giveResources($user, $plan);
    }

    /**
     * Give resources to user for onetime plans
     */
    private function giveOneTimeResources($user, $plan)
    {
        $this->giveResources($user, $plan);
    }

    /**
     * Give resources to user
     */
    private function giveResources($user, $plan)
    {
        $currentResources = $user->resources ?? [];
        $planResources = $plan->resources ?? [];

        foreach ($planResources as $resource => $amount) {
            $currentResources[$resource] = ($currentResources[$resource] ?? 0) + $amount;
        }

        $user->update(['resources' => $currentResources]);
    }

    /**
     * Get default duration based on plan type
     */
    private function getDefaultDuration($planType)
    {
        switch ($planType) {
            case 'monthly':
                return 30;
            case 'annual':
                return 365;
            case 'onetime':
            default:
                return null;
        }
    }

    
}