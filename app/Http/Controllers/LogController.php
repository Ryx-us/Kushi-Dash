<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;

class LogController extends Controller
{
    public function getLogs()
    {
        $logFile = storage_path('logs/laravel.log');

        if (File::exists($logFile)) {
            return response()->file($logFile);
        }

        return response('Log file not found', 404);
    }
}
