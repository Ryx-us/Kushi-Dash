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
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'EggID' => 'required|string|max:255',
            'imageUrl' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'additional_environmental_variables' => 'nullable|array',
        ]);

        $eggcreation_status = PterodactylEggs::create($request->all());

        return redirect()->route('admin.eggs.new')->with([
            'res' => $eggcreation_status ? 'Egg created successfully.' : 'Failed to create egg.',
            'type' => $eggcreation_status ? 'success' : 'error',
            'status' => $eggcreation_status ? 'success' : 'error'
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
            return Inertia::render('AdminAppSettings', [
                'status' => 'success',
                'message' => 'Egg deleted successfully.',
                'resources' => [], // Add your resources here
                'pterodactylSettings' => [], // Add your pterodactyl settings here
                'discordSettings' => [] // Add your discord settings here
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete egg:', ['error' => $e->getMessage()]);
            return Inertia::render('AdminAppSettings', [
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