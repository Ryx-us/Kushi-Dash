<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'total_servers' => User::sum(DB::raw("JSON_EXTRACT(resources, '$.servers')")),
            'total_memory' => User::sum(DB::raw("JSON_EXTRACT(resources, '$.memory')")),
            'total_cpu' => User::sum(DB::raw("JSON_EXTRACT(resources, '$.cpu')")),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => User::latest()->take(5)->get(),
        ]);
    }



    public function users()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::paginate(10),
        ]);
    }

    public function servers()
    {
        $users = User::whereRaw("JSON_EXTRACT(resources, '$.servers') > 0")->with('servers')->paginate(10);

        return Inertia::render('Admin/Servers', [
            'users' => $users,
        ]);
    }
}
