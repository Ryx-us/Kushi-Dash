<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

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

    public function Userindex()
{
    try {
        $plans = Plan::all();
        
        // Debug logging
        Log::info('Fetched plans:', [
            'count' => $plans->count(),
            'plans' => $plans->toArray()
        ]);

        // Check if plans exist
        if ($plans->isEmpty()) {
            Log::warning('No plans found');
        }

        return Inertia::render('User/Products', [
            'plans' => $plans,
            'debug' => true // Add this to check in frontend
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
    // Extract Newresources from the request
    $newResources = $request->input('Newresources', []);

    // Log the Newresources data
    Log::info('Newresources received:', $newResources);

    // Convert Newresources to resources and to the appropriate data type
    $resources = array_map('intval', $newResources);

    // Add resources to the request data
    $request->merge(['resources' => $resources]);

    // Validate the request data
    $validatedData = $this->validateRequest($request);

    Log::info('Validated data after conversion:', $validatedData);
    Log::info('Data received for plan creation:', $request->all());

    // Fill in null for any missing values
    $defaultValues = [
        'name' => null,
        'price' => null,
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
        'discount' => null,
        'visibility' => true,
        'redirect' => null,
        'perCustomer' => null,
        'planType' => 'monthly',
        'perPerson' => 1,
        'stock' => 0,
        'duration' => null,
        'kushiConfig' => null,
    ];

    $dataToStore = array_merge($defaultValues, $validatedData);

    // Log the resources
    Log::info('Resources received for plan creation:', [
        'resources' => $dataToStore['resources']
    ]);

    try {
        Plan::create($dataToStore);
        return redirect()->route('plans.index')->with('success', 'Plan created successfully.');
    } catch (\Exception $e) {
        Log::error('Failed to create plan: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Failed to create plan.');
    }
}
    /**
     * Show the form for editing the specified plan.
     */
    public function edit(Plan $plan)
    {
        return Inertia::render('Plans/Edit', ['plan' => $plan]);
    }

    /**
     * Update the specified plan in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        $validatedData = $this->validateRequest($request);

        // Fill in null for any missing values
        $defaultValues = [
            'price' => null,
            'icon' => null,
            'image' => null,
            'description' => null,
            'resources' => null,
            'discount' => null,
            'visibility' => true,
            'redirect' => null,
            'perCustomer' => null,
            'planType' => 'monthly',
            'perPerson' => 1,
            'stock' => 0,
            'kushiConfig' => null,
        ];

        $dataToUpdate = array_merge($defaultValues, $validatedData);

        try {
            $plan->update($dataToUpdate);
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
     * Display the specified plan in JSON format for API.
     */
    public function apiShow(Plan $plan)
    {
        try {
            return response()->json([
                'statusCode' => 200,
                'message' => 'Plan found',
                'error' => null,
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch plan: ' . $e->getMessage());
            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to fetch plan',
                'error' => $e->getMessage(),
                'plan' => null
            ], 500);
        }
    }

    /**
     * Display all plans in JSON format for API.
     */
    public function apiIndex()
    {
        try {
            $plans = Plan::all();
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
            'resources' => 'nullable|array',
            'discount' => 'nullable|numeric|min:0',
            'visibility' => 'boolean',
            'redirect' => 'nullable|string',
            'perCustomer' => 'nullable|string',
            'planType' => 'nullable|in:monthly,lifetime',
            'perPerson' => 'nullable|integer|min:1',
            'stock' => 'nullable|integer|min:0',
            'duration' => 'nullable|integer|min:0',
            'kushiConfig' => 'nullable|array',
        ]);
    }
}