<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

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

    // GET request: Return a specific user by ID as JSON
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
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
