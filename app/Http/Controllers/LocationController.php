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

    /**
     * Display the specified location.
     *
     * @param  int  $locationId
     * @return \Illuminate\Http\Response
     */
    public function show($locationId)
    {
        try {
            // Find the location by ID
            $location = Location::findOrFail($locationId);

            // Return the location data as JSON
            return response()->json([
                'statusCode' => 200,
                'message' => 'Location found',
                'error' => null,
                'location' => $location,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to find location: ' . $e->getMessage());

            // Return a 404 response if the location is not found
            return response()->json([
                'statusCode' => 404,
                'message' => 'Location not found',
                'error' => $e->getMessage(),
                'location' => null,
            ], 404);
        }
    }
    

    /**
     * Update the specified location in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $locationId
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $locationId)
{
    // Validate the incoming data
    $validatedData = $request->validate([
        'name' => 'required|string|max:255',
        'location' => 'required|string|max:255',
        'servers' => 'nullable|integer|min:0',
        'flag' => 'required|string|url|max:255',
        'maxservers' => 'required|integer|min:0',
        'latencyurl' => 'required|string|url|max:255',
        'requiredRank' => 'required|string|max:255',
        'maintenance' => 'required|boolean',
        'requiredSubscriptions' => 'nullable|array',
        'requiredSubscriptions.*' => 'exists:plans,id',
        'coinRenewal' => 'nullable|string|max:255',
        'platform' => 'required|string|max:255',
        'platform_settings' => 'nullable|json',
    ]);

    try {
        // Find the location by ID
        $location = Location::findOrFail($locationId);

        // Update location attributes
        $location->name = $validatedData['name'];
        $location->location = $validatedData['location'];
        $location->servers = $validatedData['servers'] ?? 0;
        $location->flag = $validatedData['flag'];
        $location->maxservers = $validatedData['maxservers'];
        $location->latencyurl = $validatedData['latencyurl'];
        $location->requiredRank = $validatedData['requiredRank'];
        $location->maintenance = $validatedData['maintenance'];
        $location->requiredSubscriptions = $validatedData['requiredSubscriptions'] ?? [];
        $location->coinRenewal = $validatedData['coinRenewal'] ?? null;
        $location->platform = $validatedData['platform'];
        $location->platform_settings = $validatedData['platform_settings'] ?? null;

        // Save the updated location
        $location->save();

        return redirect()->route('locations.Viewedit', ['locationId' => $locationId])
    ->with('success', 'Location updated successfully.');

    } catch (\Exception $e) {
        Log::error('Failed to update location: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to update location',
            'error' => $e->getMessage()
        ], 500);
    }
}
    

    public function Viewindex()
    {
        $plans = Location::all();
        return Inertia::render('AdminLocations', ['locations' => $plans]);
    }

    public function ViewEdit($locationId)
{
    // Fetch the specific location
    $location = Location::findOrFail($locationId);

    // Pass the location to the Inertia view
    return Inertia::render('AdminLocationsEdit', ['location' => $location]);
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