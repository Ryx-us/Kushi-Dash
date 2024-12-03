<?php

namespace App\Http\Controllers;

use App\Models\VMS;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class VMsController extends Controller
{
    public function index()
    {
        // Check if VMs are enabled in environment
        if (!config('services.vms.enabled', false)) {
            return response()->json([
                'enabled' => false,
                'message' => 'Virtual Machines are not enabled on this instance'
            ], 403);
        }

        $vms = VMS::where('is_enabled', true)->get();

        return response()->json([
            'enabled' => true,
            'vms' => $vms
        ]);
    }

    public function Userindex()
{

    $vms = VMS::where('is_enabled', true)->get();

    return Inertia::render('AdminVMView', [
        'vms' => $vms
    ]);
}

    public function create()
    {
        
        return Inertia::render('AdminVMCreate');
    }

    public function destroy($id)
{
    try {
        $vm = VMS::findOrFail($id);
        $vm->delete();

        return redirect()
            ->route('admin.vms.index')
            ->with('success', 'VM template deleted successfully');
            
    } catch (\Exception $e) {
        return redirect()
            ->route('admin.vms.index')
            ->with('error', 'Failed to delete VM template');
    }
}

    

    public function store(Request $request)
{
    // Validate request data
    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'required|string',
        'egg_id' => 'required|string|max:255',
        'nest_id' => 'required|string|max:255',
        'image_url' => 'nullable|string|url|max:255',
        'icon' => 'nullable|string|url|max:255',
        'rank' => 'required|string|in:admin,premium,user,null',
        'is_enabled' => 'boolean'
    ]);

    Log::info('Creating new VM configuration:', ['request' => $request->all()]);

    try {
        $vm = VMS::create([
            'name' => $request->name,
            'description' => $request->description,
            'egg_id' => $request->egg_id,
            'nest_id' => $request->nest_id,
            'image_url' => $request->image_url,
            'icon' => $request->icon,
            'rank' => $request->rank,
            'is_enabled' => $request->is_enabled ?? true
        ]);

        Log::info('VM configuration created successfully:', ['vm' => $vm]);

        return redirect()->back()->with('success', 'Vm created successfully');

    } catch (\Exception $e) {
        Log::error('Failed to create VM configuration:', ['error' => $e->getMessage()]);

        return redirect()->route('admin.vms.create')->with([
            'res' => 'Failed to create VM configuration: ' . $e->getMessage(),
            'type' => 'error',
            'status' => 'error'
        ]);
    }
}

    public function show($id)
    {
        if (!config('services.vms.enabled', false)) {
            return response()->json([
                'enabled' => false,
                'message' => 'Virtual Machines are not enabled'
            ], 403);
        }

        $vm = VMS::findOrFail($id);
        return response()->json($vm);
    }
}