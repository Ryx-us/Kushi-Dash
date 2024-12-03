<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CDNController extends Controller
{
    private $maxFileSize = 5242880; // 5MB limit
    private $maxStorageLimit;

    public function __construct()
{
    $this->maxStorageLimit = env('CDN_MAX_STORAGE_MB', 100) * 1024 * 1024; // Convert MB to bytes
}


    
    public function index()
    {
        $storageMetrics = $this->getStorageMetrics();
        
        return Inertia::render('CDN/Index', [
            'files' => $this->getFiles(),
            'maxSize' => $this->maxFileSize,
            'storage' => $storageMetrics
        ]);
    }

    public function destroy($filename)
    {
        try {
            if (Storage::disk('public')->exists('cdn/' . $filename)) {
                Storage::disk('public')->delete('cdn/' . $filename);
                return redirect()->back()->with([
                    'status' => 'success',
                    'message' => 'File deleted successfully'
                ]);
            }
            
            return redirect()->back()->with([
                'status' => 'error',
                'message' => 'File not found'
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with([
                'status' => 'error',
                'message' => 'Delete failed: ' . $e->getMessage()
            ]);
        }
    }

    public function getFiles()
    {
        $files = Storage::disk('public')->files('cdn');
        return collect($files)->map(function($file) {
            return [
                'name' => basename($file),
                'size' => Storage::disk('public')->size($file),
                'url' => Storage::disk('public')->url($file),
                'created_at' => Storage::disk('public')->lastModified($file)
            ];
        });
    }

    private function getStorageMetrics()
    {
        $totalUsed = 0;
        $files = Storage::disk('public')->files('cdn');
        
        foreach ($files as $file) {
            $totalUsed += Storage::disk('public')->size($file);
        }

        return [
            'used' => $totalUsed,
            'usedMB' => round($totalUsed / 1024 / 1024, 2),
            'total' => $this->maxStorageLimit,
            'totalMB' => round($this->maxStorageLimit / 1024 / 1024, 2),
            'free' => $this->maxStorageLimit - $totalUsed,
            'freeMB' => round(($this->maxStorageLimit - $totalUsed) / 1024 / 1024, 2),
            'percentUsed' => round(($totalUsed / $this->maxStorageLimit) * 100, 2)
        ];
    }

    public function store(Request $request)
{
    try {
        // Validate the request
        $request->validate([
            'file' => 'required|file|max:5120'
        ]);

        // Get storage metrics
        $storageMetrics = $this->getStorageMetrics();

        // Get file size
        $fileSize = $request->file('file')->getSize();

        // Check if storage limit is exceeded
        if (($storageMetrics['used'] + $fileSize) > $this->maxStorageLimit) {
            return redirect()->back()->with([
                'status' => 'error',
                'message' => 'Storage limit exceeded'
            ]);
        }

        // Store the file
        $file = $request->file('file');
        $path = Storage::disk('public')->putFile('cdn', $file);

        // Return success response
        return redirect()->back()->with([
            'status' => 'success',
            'message' => 'File uploaded successfully'
        ]);

    } catch (\Exception $e) {
        // Return error response
        return redirect()->back()->with([
            'status' => 'error',
            'message' => 'Upload failed: ' . $e->getMessage()
        ]);
    }
}
}