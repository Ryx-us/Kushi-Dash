<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Plan;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Jobs\HandlePlanExpiration;

class UserController extends Controller
{
    // GET request: Return all users as JSON
    public function index()
    {
        $users = User::all();
        return inertia('UsersView', [
            'users' => $users // Passing the users to the Inertia view
        ]);
    }

    public function purchaseResource(Request $request)
{
    try {
        $request->validate([
            'resource' => 'required|string|in:cpu,memory,disk,databases,allocations,backups,servers',
            'quantity' => 'required|integer|min:1'
        ]);

        $user = $request->user();
        $resource = $request->input('resource');
        $quantity = $request->input('quantity');
        
        // Get prices from config
        $prices = config('shop.prices');
        $maxLimits = [
            'cpu' => config('shop.max_cpu'),
            'memory' => config('shop.max_memory'),
            'disk' => config('shop.max_disk'),
            'databases' => config('shop.max_databases'),
            'allocations' => config('shop.max_allocations'),
            'backups' => config('shop.max_backups'),
            'servers' => config('shop.max_servers')
        ];

        if (!isset($prices[$resource])) {
            throw ValidationException::withMessages([
                'resource' => 'Invalid resource type'
            ]);
        }

        if (!$prices[$resource]['enabled']) {
            throw ValidationException::withMessages([
                'resource' => 'This resource is currently disabled'
            ]);
        }

        $amount = $prices[$resource]['amount'] * $quantity;
        $cost = $prices[$resource]['cost'] * $quantity;
        
        // Check if user has enough coins
        if ($user->coins < $cost) {
            throw ValidationException::withMessages([
                'coins' => 'Insufficient coins'
            ]);
        }

        // Check if purchase would exceed max limits
        $currentValue = $user->limits[$resource] ?? 0;
        $newTotal = $currentValue + $amount;

        Log::info('Purchase validation:', [
            'user' => $user->id,
            'resource' => $resource,
            'current_value' => $currentValue,
            'amount' => $amount,
            'new_total' => $newTotal,
            'max_limit' => $maxLimits[$resource]
        ]);

        if ($newTotal > $maxLimits[$resource]) {
            throw ValidationException::withMessages([
                'quantity' => 'Purchase would exceed maximum limit'
            ]);
        }

        // Process purchase in transaction
        DB::transaction(function () use ($user, $resource, $amount, $cost) {
            // Deduct coins
            $user->coins -= $cost;
            
            // Update limits
            $limits = $user->limits;
            $limits[$resource] = ($limits[$resource] ?? 0) + $amount;
            $user->limits = $limits;
            
            $user->save();
        });

        // Send message to Discord webhook
        $webhookUrl = env('DISCORD_WEBHOOK');

        
        $message = [
            'embeds' => [
                [
                    'title' => 'Purchase Notification',
                    'description' => "User **{$user->name}** successfully purchased **{$amount} {$resource}** for **{$cost} coins**.",
                    'color' => 0x00FF00, // Green color for success
                    'fields' => [
                        [
                            'name' => 'User ID',
                            'value' => $user->id,
                            'inline' => true
                        ],
                        [
                            'name' => 'Discord ID',
                            'value' => $user->discord_id,
                            'inline' => true
                        ],
                        [
                            'name' => 'Resource',
                            'value' => $resource,
                            'inline' => true
                        ],
                        [
                            'name' => 'Amount',
                            'value' => $amount,
                            'inline' => true
                        ],
                        [
                            'name' => 'Cost',
                            'value' => $cost,
                            'inline' => true
                        ]
                    ],
                    'footer' => [
                        'text' => 'Please check if there is abuse, Kushi Dash logs v0.1'
                    ]
                ]
            ]
        ];
        
        $response = Http::post($webhookUrl, $message);

        if ($response->successful()) {
            Log::info('Purchase successful:', [
                'user' => $user->id,
                'resource' => $resource,
                'amount' => $amount,
                'cost' => $cost
            ]);
            return back()->with('status', 'Success: Successfully purchased ' . $amount . ' ' . $resource);
        } else {
            Log::warning('Purchase successful but failed to send Discord notification:', [
                'user' => $user->id,
                'resource' => $resource,
                'amount' => $amount,
                'cost' => $cost
            ]);
            return back()->with('status', 'Success: Purchase successful, but failed to send Discord notification');
        }

    } catch (ValidationException $e) {
        Log::error('Validation failed:', [
            'user' => $request->user()->id,
            'errors' => $e->errors()
        ]);
        return back()->with('status', 'ERROR: Do you have enough coins? If not this might be our problem');
    } catch (\Exception $e) {
        Log::error('Purchase failed:', [
            'user' => $request->user()->id,
            'error' => $e->getMessage()
        ]);

        return back()->with('status', 'Failed to process purchase');
    }
}

    // GET request: Return a specific user by ID as JSON
    public function show($id)
{
    try {
        $user = User::findOrFail($id);
        
        // Get active subscriptions
        $subscriptions = UserSubscription::where('user_id', $id)
            ->where('status', UserSubscription::STATUS_ACTIVE)
            ->with('plan')
            ->get()
            ->map(function($subscription) {
                $subscription->days_remaining = $subscription->getDaysRemainingAttribute();
                return $subscription;
            });
        
        // Append subscriptions to user data
        $userData = $user->toArray();
        $userData['subscriptions'] = $subscriptions;
        
        return response()->json($userData);
       
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Error fetching user:', [
            'id' => $id,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Something went wrong'
        ], 503);
    }
}

    public function showClient(Request $request, $id)
{
    $user = User::findOrFail($id);
    
    if ($request->email === $user->email) {
        return response()->json([
            'user' => $user,
            
        ]);
    }

    return response()->json([
        'message' => 'Unauthorized. Please stop peaking around the APIs and go watch soggy cereal :D'
    ], 401);
}

    

    // POST request: Return all users as an Inertia flash message
    public function store(Request $request)
    {
        $users = User::all();
        return back()->with('res', $users);
    }

    public function edit($id)
    {
        $user = User::findOrFail($id);
        Log::info('User data retrieved for edit:', ['user' => $user]);
        return Inertia::render('AdminUserEdit', ['userId' => $id]);
    }

    public function destroy($id)
{
    try {
        Log::info('Delete user request received', ['user_id' => $id]);

        $user = User::find($id);
        
        if (!$user) {
            Log::warning('User not found for deletion', ['user_id' => $id]);
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $user->delete();

        Log::info('User deleted successfully', [
            'user_id' => $id,
            'user_details' => $user->toArray()
        ]);

        if (request()->expectsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ]);
        }

        return back()->with([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ]);
    } catch (\Exception $e) {
        Log::error('Failed to delete user', [
            'user_id' => $id,
            'error' => $e->getMessage()
        ]);

        if (request()->expectsJson()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete user'
            ], 500);
        }

        return back()->withErrors([
            'error' => 'Failed to delete user'
        ]);
    }
}

    // PUT request: Update user's rank and other details
    public function update(Request $request, $id)
{
    // Log when the update route is accessed
    Log::info('Update route accessed', [
        'user_id' => $id,
        'request_data' => $request->all(),
    ]);

    // Validate incoming request data
    $validator = Validator::make($request->all(), [
        'newName' => 'required|string|max:255',
        'newEmail' => 'required|email|max:255',
        'newDiscordId' => 'nullable|string|max:255',
        'newRank' => 'nullable|string|in:free,premium,admin',
        'newCoins' => 'nullable|integer|min:0',
        'newResources' => 'nullable|array',
        'newLimits' => 'nullable|array',
        'newPterodactylId' => 'nullable|string|max:255',
        'planIds' => 'nullable|array', // Add validation for plan IDs
        'planIds.*' => 'integer|exists:plans,id', // Validate each plan ID exists
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => $validator->errors(),
        ], 422);
    }

    // Find the user by ID
    $user = User::find($id);
    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'User not found',
        ], 404);
    }

    // Update user attributes
    $user->name = $request->newName;
    $user->email = $request->newEmail;
    $user->discord_id = $request->newDiscordId;
    $user->rank = $request->newRank;
    $user->coins = $request->newCoins ?? $user->coins;
    $user->resources = $request->newResources ?? $user->resources;
    $user->limits = $request->newLimits ?? $user->limits;
    $user->pterodactyl_id = $request->newPterodactylId ?? $user->pterodactyl_id;
    
    // Update purchases_plans if provided
    if ($request->has('planIds')) {
        $user->purchases_plans = array_unique($request->planIds);
    }

    // Save the updated user to the database
    $user->save();

    Log::info('User updated successfully', [
        'user_id' => $id,
        'updated_data' => $request->all(),
        'purchases_plans' => $user->purchases_plans,
    ]);

    return back()->with('status', 'success');
}

/**
 * Admin assigns plan to user
 */
public function grantPlan(Request $request, $userId)
{
    $request->validate([
        'planId' => 'required|exists:plans,id',
        'planType' => 'required|in:monthly,annual,onetime',
    ]);

    try {
        $user = User::findOrFail($userId);
        $plan = Plan::findOrFail($request->planId);

        // Calculate expiration date based on plan type
        $expiresAt = null;
        if ($request->planType === 'monthly') {
            $expiresAt = now()->addMonth();
        } elseif ($request->planType === 'annual') {
            $expiresAt = now()->addYear();
        }

        // Create subscription record
        $subscription = UserSubscription::create([
            'user_id' => $userId,
            'plan_id' => $request->planId,
            'status' => UserSubscription::STATUS_ACTIVE,
            'expires_at' => $expiresAt,
            'granted_by' => auth()->id(),
        ]);

        // Add plan resources to user
        $this->addPlanToUser($user, $plan);

        // Schedule expiration job if the plan expires
        if ($expiresAt) {
            HandlePlanExpiration::dispatch($subscription)->delay($expiresAt);
        }

        return response()->json([
            'success' => true,
            'message' => 'Plan granted successfully',
            'subscription' => $subscription
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to grant plan', [
            'user_id' => $userId,
            'plan_id' => $request->planId,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to grant plan: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Add plan resources to user
 */
private function addPlanToUser($user, $plan)
{
    // Add to user's limits
    $currentLimits = $user->limits ?? [];
    $planResources = $plan->resources ?? [];

    foreach ($planResources as $resourceType => $amount) {
        $currentLimits[$resourceType] = ($currentLimits[$resourceType] ?? 0) + $amount;
    }

    // Add plan to purchases_plans
    $purchasesPlans = $user->purchases_plans ?? [];
    if (!in_array($plan->id, $purchasesPlans)) {
        $purchasesPlans[] = $plan->id;
    }

    $user->update([
        'limits' => $currentLimits,
        'purchases_plans' => $purchasesPlans,
        'rank' => 'premium' // Update rank if not already premium
    ]);
}

/**
 * Get user subscriptions
 */
public function getSubscriptions($userId)
{
    try {
        $user = User::findOrFail($userId);
        $subscriptions = UserSubscription::where('user_id', $userId)
            ->where('status', UserSubscription::STATUS_ACTIVE)
            ->with('plan')
            ->get()
            ->map(function($subscription) {
                // Add days_remaining directly to avoid access issues with appended attributes
                $subscription->days_remaining = $subscription->getDaysRemainingAttribute();
                return $subscription;
            });

        return response()->json([
            'success' => true,
            'subscriptions' => $subscriptions
        ]);
    } catch (\Exception $e) {
        Log::error('Failed to get user subscriptions', [
            'user_id' => $userId,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to get user subscriptions: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Cancel a subscription
 */

public function cancelSubscription($subscriptionId)
{
    try {
        $subscription = UserSubscription::findOrFail($subscriptionId);
        
        // Mark as cancelled
        $subscription->update([
            'status' => UserSubscription::STATUS_EXPIRED // Using EXPIRED for consistency
        ]);
        
        // Dispatch job to handle resource removal
        HandlePlanExpiration::dispatch($subscription);
        
        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully'
        ]);
    } catch (\Exception $e) {
        Log::error('Failed to cancel subscription', [
            'subscription_id' => $subscriptionId,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to cancel subscription: ' . $e->getMessage()
        ], 500);
    }
}
}
