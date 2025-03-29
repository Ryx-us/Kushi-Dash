<?php

namespace App\Http\Controllers\Pterodactyl;

use App\Http\Controllers\Controller;
use App\Models\PterodactylEggs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PterodactylEggController extends Controller
{
    public function index()
    {
        $eggs = PterodactylEggs::all();
        return Inertia::render('AdminDashboard', ['eggs' => $eggs]);
    }

    public function new()
    {
        $eggs = PterodactylEggs::all();
        return Inertia::render('AdminEggsCreate', ['eggs' => $eggs]);
    }

    public function store(Request $request)
{
    // Begin with detailed request logging
    Log::info('==== EGG CREATION STARTED ====');
    Log::info('Raw request data:', [
        'all' => $request->all(),
        'method' => $request->method(),
        'url' => $request->fullUrl(),
        'ip' => $request->ip(),
        'headers' => $request->header(),
        'user' => auth()->user() ? auth()->user()->id : 'unauthenticated'
    ]);

    try {
        // Log the validation rules we're about to apply
        Log::info('Validation rules being applied:', [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'EggID' => 'required|string|max:255',
            'nestId' => 'nullable|string|max:255',
            'nest_id' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'additional_environmental_variables' => 'nullable|array',
            'plans' => 'nullable|array',
        ]);

        // Check database schema
        try {
            $columns = \Schema::getColumnListing('pterodactyl_eggs');
            Log::info('Database columns for pterodactyl_eggs table:', ['columns' => $columns]);
        } catch (\Exception $se) {
            Log::error('Failed to get schema info:', ['error' => $se->getMessage()]);
        }

        // Log model fillable attributes
        Log::info('PterodactylEggs model fillable attributes:', [
            'fillable' => (new PterodactylEggs)->getFillable()
        ]);

        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'EggID' => 'required|string|max:255',
            'nestId' => 'nullable|string|max:255',
            'nest_id' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'additional_environmental_variables' => 'nullable|array',
            'plans' => 'nullable|array',
        ]);

        Log::info('Data validated successfully:', ['validatedData' => $validatedData]);

        // Create data array for egg creation
        $eggData = $validatedData;
        
        // Handle the nest_id / nestId discrepancy
        if (isset($eggData['nest_id']) && !isset($eggData['nestId'])) {
            Log::info('Converting nest_id to nestId:', [
                'nest_id' => $eggData['nest_id']
            ]);
            $eggData['nestId'] = $eggData['nest_id'];
            unset($eggData['nest_id']); // Remove the underscored version
        }
        
        // Ensure plans exists and is at least an empty array
        if (!isset($eggData['plans'])) {
            Log::info('No plans provided, setting to empty array');
            $eggData['plans'] = [];
        }
        
        // Filter environmental variables if they exist
        if (isset($eggData['additional_environmental_variables'])) {
            Log::info('Before filtering env variables:', [
                'env_vars' => $eggData['additional_environmental_variables']
            ]);
            
            $eggData['additional_environmental_variables'] = array_filter(
                $eggData['additional_environmental_variables'], 
                function($value) { return !empty(trim($value)); }
            );
            
            Log::info('After filtering env variables:', [
                'env_vars' => $eggData['additional_environmental_variables']
            ]);
        }
        
        Log::info('Egg data prepared for creation:', ['eggData' => $eggData]);
        
        // Log DB connection status
        try {
            $connected = \DB::connection()->getPdo() ? true : false;
            Log::info('Database connection status:', ['connected' => $connected]);
        } catch (\Exception $dbe) {
            Log::error('Database connection error:', ['error' => $dbe->getMessage()]);
        }
        
        // Create the egg with the processed data
        Log::info('About to create egg with data', ['data' => json_encode($eggData)]);
        
        try {
            $egg = PterodactylEggs::create($eggData);
            Log::info('Egg created successfully:', ['egg' => $egg->toArray()]);
        } catch (\Exception $ce) {
            Log::error('Error during PterodactylEggs::create()', [
                'error' => $ce->getMessage(),
                'file' => $ce->getFile(),
                'line' => $ce->getLine(),
                'trace' => $ce->getTraceAsString()
            ]);
            throw $ce; // Re-throw to be caught by the outer try-catch
        }

        Log::info('==== EGG CREATION COMPLETED SUCCESSFULLY ====');

        return redirect()->route('admin.eggs.new')->with([
            'res' => 'Egg created successfully.',
            'type' => 'success',
            'status' => 'success'
        ]);

    } catch (\Exception $e) {
        Log::error('==== EGG CREATION FAILED ====');
        Log::error('Complete error details:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'code' => $e->getCode(),
            'trace' => $e->getTraceAsString(),
            'previous' => $e->getPrevious() ? [
                'message' => $e->getPrevious()->getMessage(),
                'file' => $e->getPrevious()->getFile(),
                'line' => $e->getPrevious()->getLine()
            ] : null
        ]);
        
        // Try to get more detailed SQL error if applicable
        if ($e instanceof \Illuminate\Database\QueryException) {
            Log::error('SQL Error Details:', [
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings()
            ]);
        }

        return redirect()->route('admin.eggs.new')->with([
            'res' => 'Failed to create egg: ' . $e->getMessage(),
            'type' => 'error',
            'status' => 'error'
        ]);
    }
}

    

    public function getEggInfo($id)
{
    $egg = PterodactylEggs::findOrFail($id);

    if (!$egg) {
        return response()->json([
            'error' => 'Egg not found',
            'status' => 404
        ], 404);
    }

    return response()->json([
        'status' => 200,
        'data' => [
            'id' => $egg->id,
            'name' => $egg->name,
            'description' => $egg->description,
            'EggID' => $egg->EggID,
            'imageUrl' => $egg->imageUrl,
            'icon' => $egg->icon,
            'additional_environmental_variables' => $egg->additional_environmental_variables
        ]
    ]);
}

    public function edit($id)
    {
        $egg = PterodactylEggs::findOrFail($id);
        return Inertia::render('AdminEggEdit', ['egg' => $egg]);
    }

    public function update(Request $request, PterodactylEggs $egg)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'EggID' => 'required|string|max:255',
            'nestId' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'additional_environmental_variables' => 'nullable|array',
        ]);
        Log::warning('WARNING NEW EGG CHANGE @ ' . json_encode($egg));
        Log::warning('Kushi Engine: ' . json_encode($request->all()));

        $egg->update($request->all());
        return redirect()->route('admin.eggs.index')->with('res', 'Egg updated successfully.');
    }

    public function show($id)
    {
        $egg = PterodactylEggs::where('id', $id)->first();

        if (!$egg) {
            return response()->json(['error' => 'Egg not found'], 404);
        }

        return response()->json($egg);
    }

    public function audit()
    {
        return Inertia::render('AdminAuditLog');
    }

    public function serversshow($EggID)
    {
        $egg = PterodactylEggs::where('EggID', $EggID)->first();

        if (!$egg) {
            return response()->json(['error' => 'Kushi Engine 404'], 404);
        }

        return response()->json($egg);
    }

    public function destroy(PterodactylEggs $egg)
    {
        Log::info('Received request to delete egg:', ['egg' => $egg]);

        try {
            $egg->delete();
            Log::info('Egg deleted successfully:', ['egg' => $egg]);
            return redirect()->route('admin.eggs.index')->with([
                'status' => 'success',
                'message' => 'Egg deleted successfully.',
                'resources' => [], // Add your resources here
                'pterodactylSettings' => [], // Add your pterodactyl settings here
                'discordSettings' => [] // Add your discord settings here
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete egg:', ['error' => $e->getMessage()]);
            return redirect()->route('admin.eggs.index')->with([
                'status' => 'error',
                'message' => 'Failed to delete egg.',
                'resources' => [], // Add your resources here
                'pterodactylSettings' => [], // Add your pterodactyl settings here
                'discordSettings' => [] // Add your discord settings here
            ]);
        }
    }

    public function getAllEggs()
    {
        $eggs = PterodactylEggs::all();
        return response()->json($eggs);
    }
}

