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
    

    
public function update(Request $request, $locationId)
{
    Log::info('Starting location update', [
        'locationId' => $locationId,
        'requestData' => $request->all()
    ]);

    try {
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
            'coinRenewal' => 'nullable',
            'platform' => 'required|string|max:255',
            'platform_settings' => 'nullable',
        ]);

        Log::info('Validation passed', ['validatedData' => $validatedData]);

        // Find the location by ID
        $location = Location::findOrFail($locationId);
        Log::info('Found location', ['locationBeforeUpdate' => $location->toArray()]);

        // Process coinRenewal if it's an array
        if (!empty($validatedData['coinRenewal']) && is_array($validatedData['coinRenewal'])) {
            Log::info('Processing coinRenewal array', ['coinRenewal' => $validatedData['coinRenewal']]);
            $validatedData['coinRenewal'] = json_encode([
                'amount' => $validatedData['coinRenewal']['amount'] ?? 0,
                'hours' => $validatedData['coinRenewal']['hours'] ?? 0,
                'exceptions' => $validatedData['coinRenewal']['exceptions'] ?? []
            ]);
        } else if (is_string($validatedData['coinRenewal'])) {
            Log::info('coinRenewal is already a string', ['coinRenewal' => $validatedData['coinRenewal']]);
            // Keep it as is, it's already JSON
        } else {
            Log::info('Setting coinRenewal to null');
            $validatedData['coinRenewal'] = null;
        }

        // Process platform_settings if needed
        if (!empty($validatedData['platform_settings'])) {
            if (is_array($validatedData['platform_settings'])) {
                Log::info('Converting platform_settings array to JSON', [
                    'platform_settings' => $validatedData['platform_settings']
                ]);
                $validatedData['platform_settings'] = json_encode($validatedData['platform_settings']);
            } else if (is_string($validatedData['platform_settings'])) {
                // Check if valid JSON
                json_decode($validatedData['platform_settings']);
                if (json_last_error() === JSON_ERROR_NONE) {
                    Log::info('platform_settings is already valid JSON');
                } else {
                    Log::warning('Invalid JSON in platform_settings', [
                        'platform_settings' => $validatedData['platform_settings'],
                        'error' => json_last_error_msg()
                    ]);
                    // Try to fix or nullify based on your requirements
                    $validatedData['platform_settings'] = null;
                }
            }
        } else {
            Log::info('Setting platform_settings to null');
            $validatedData['platform_settings'] = null;
        }

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
        $location->coinRenewal = $validatedData['coinRenewal'];
        $location->platform = $validatedData['platform'];
        $location->platform_settings = $validatedData['platform_settings'];

        Log::info('Location updated, preparing to save', [
            'locationAfterUpdate' => $location->toArray()
        ]);

        // Save the updated location
        $location->save();
        Log::info('Location saved successfully');

        return redirect()->route('locations.Viewedit', ['locationId' => $locationId])
            ->with('success', 'Location updated successfully.');

    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Validation failed', [
            'errors' => $e->errors(),
        ]);
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        Log::error('Location not found', [
            'locationId' => $locationId,
            'exception' => $e->getMessage()
        ]);
        return response()->json([
            'message' => 'Location not found',
            'error' => $e->getMessage()
        ], 404);
    } catch (\Exception $e) {
        Log::error('Failed to update location', [
            'locationId' => $locationId,
            'exception' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
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