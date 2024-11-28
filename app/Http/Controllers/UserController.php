<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        
        return response()->json($user);
       
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
            'message' => 'Internal server error'
        ], 500);
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
}
