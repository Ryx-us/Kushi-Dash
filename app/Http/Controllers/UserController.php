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
