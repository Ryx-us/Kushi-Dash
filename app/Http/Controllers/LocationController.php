<?php

namespace App\Http\Controllers;

use App\Models\Location;  // Correct import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'servers' => 'required|integer',
                'flag' => 'required|url',
                'maxservers' => 'required|integer',
                'latencyurl' => 'required|string',
                'requiredRank' => 'required|integer',
                'maintenance' => 'required|boolean',
                'requiredSubscriptions' => 'required|array',
                'coinRenewal' => 'required|array',
                'platform' => 'required|string',
                'platform_settings' => 'required|array'
            ]);

            $location = Location::create($validated);

            return response()->json([
                'statusCode' => 201,
                'message' => 'Location created successfully',
                'error' => null,
                'location' => $location
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create location: ' . $e->getMessage());
            return response()->json([
                'statusCode' => 500,
                'message' => 'Failed to create location',
                'error' => $e->getMessage(),
                'location' => null
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
            return response()->json([
                'statusCode' => 200,
                'message' => 'Location deleted successfully',
                'error' => null
            ]);
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