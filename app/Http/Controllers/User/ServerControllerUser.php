<?php
// app/Http/Controllers/ServerController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Server; // Assuming you have a Server model
use App\Models\Location; // Assuming you have a Location model
use App\Models\Egg; // Assuming you have an Egg model
use Inertia\Inertia;

class ServerControllerUser extends Controller
{
    public function create()
    {
        $locations = Location::all();
        $eggs = Egg::all();

        return Inertia::render('Servers/Create', [
            'locations' => $locations,
            'eggs' => $eggs,
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'egg_id' => 'required|exists:eggs,id',
            'memory' => 'required|integer|min:512|max:16384',
            'disk' => 'required|integer|min:1000|max:50000',
            'cpu' => 'required|integer|min:1|max:400',
            'databases' => 'nullable|integer|min:0',
            'backups' => 'nullable|integer|min:0',
            'allocations' => 'nullable|integer|min:0',
        ]);

        Server::create($validatedData);

        return redirect()->route('servers.create')->with('success', 'Server created successfully.');
    }
}