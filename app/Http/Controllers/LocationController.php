<?php

namespace App\Http\Controllers;

use App\Models\Location;  // Correct import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        try {
            $locations = Location::all();  // Correct reference
            return response()->json([
                'statusCode' => 200,
                'message' => 'Locations found',
                'error' => null,
                'locations' => $locations
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch locations: ' . $e->getMessage());
            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to fetch locations',
                'error' => $e->getMessage(),
                'locations' => []
            ], 500);
        }
    }

    public function Viewindex()
    {
        $plans = Location::all();
        return Inertia::render('AdminLocations', ['locations' => $plans]);
    }

    public function Viewcreate()
    {
        $plans = Location::all();
        return Inertia::render('AdminLocationCreate', ['locations' => $plans]);
    }

    public function store(Request $request)
{
    try {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'location' => 'required|string', // Added location field
            'servers' => 'nullable|integer',
            'flag' => 'required|string',
            'maxservers' => 'nullable|integer',
            'latencyurl' => 'required|string',
            'requiredRank' => 'nullable|string',
            'maintenance' => 'nullable|boolean',
            'requiredSubscriptions' => 'nullable|array',
            'coinRenewal' => 'nullable',
            'platform' => 'required|integer',
            'platform_settings' => 'nullable|array'
        ]);

        // Handle coinRenewal
        if (!empty($validatedData['coinRenewal']) && is_array($validatedData['coinRenewal'])) {
            $validatedData['coinRenewal'] = json_encode([
                'amount' => $validatedData['coinRenewal']['amount'] ?? 0,
                'hours' => $validatedData['coinRenewal']['hours'] ?? 0,
                'exceptions' => $validatedData['coinRenewal']['exceptions'] ?? []
            ]);
        } else {
            $validatedData['coinRenewal'] = null;
        }

        // Handle platform_settings
        if (!empty($validatedData['platform_settings'])) {
            $validatedData['platform_settings'] = json_encode($validatedData['platform_settings']);
        }

        $location = Location::create($validatedData);

        return redirect()->route('locations.Viewindex')->with('success', 'Location created successfully.'); 

    } catch (\Exception $e) {
        Log::error('Creation error: ' . $e->getMessage());
        return response()->json([
            'statusCode' => 500,
            'message' => 'Failed to create location',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Display the specified plan in JSON format.
     *
     * @param  \App\Models\Plan  $plan
     * @return \Illuminate\Http\JsonResponse
     */

    


    public function destroy(Location $location)
    {
        try {
            $location->delete();
            return back()->with('status', 'Location deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete location: ' . $e->getMessage());
            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to delete location',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}