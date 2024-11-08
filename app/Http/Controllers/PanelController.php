<?php

// app/Http/Controllers/PanelController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PanelController extends Controller
{
    /**
     * Display the panel page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Panel/Panel');
    }
}
