<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class LogController extends Controller
{
    /**
     * Get the Laravel log file contents
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function getLogs(Request $request)
    {
        $logFile = storage_path('logs/laravel.log');
        
        if (!File::exists($logFile)) {
            return response('Log file not found', 404);
        }
        
        // Get the requested number of lines (default: 250)
        $lines = $request->input('l', 250);
        
        // Validate lines parameter
        if (!is_numeric($lines) || $lines <= 0) {
            return response()->json(['error' => 'Invalid lines parameter'], 400);
        }
        
        // Cap to a reasonable maximum to prevent performance issues
        $maxLines = 1000;
        $lines = min($lines, $maxLines);
        
        // Read the last $lines from the log file
        $content = $this->tailFile($logFile, $lines);
        
        // Return as plain text
        return response($content)
            ->header('Content-Type', 'text/plain')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
    
    /**
     * Read the last N lines from a file
     * 
     * @param string $filePath
     * @param int $lines
     * @return string
     */
    private function tailFile($filePath, $lines)
    {
        // Handle very large files efficiently
        $file = @fopen($filePath, 'r');
        
        if (!$file) {
            return "Unable to open log file";
        }
        
        // Jump to the end of the file
        fseek($file, 0, SEEK_END);
        $fileSize = ftell($file);
        
        // Empty file case
        if ($fileSize == 0) {
            fclose($file);
            return "Log file is empty";
        }
        
        // Store lines
        $output = [];
        $chunk = 4096;
        $position = $fileSize - $chunk;
        $remainder = "";
        
        // Read chunks from the end of the file
        while (count($output) < $lines && $position >= 0) {
            // Set position to read from
            fseek($file, $position);
            
            // Read a chunk
            $data = fread($file, $chunk);
            
            // Split into lines and prepend remainder
            $data .= $remainder;
            $newLines = explode("\n", $data);
            
            // Save the incomplete first line for next iteration
            $remainder = array_shift($newLines);
            
            // Add complete lines to output
            $output = array_merge($newLines, $output);
            
            // Move position back for next iteration
            $position -= $chunk;
        }
        
        // Handle the first chunk case
        if ($position < 0 && $remainder) {
            $output = array_merge([$remainder], $output);
        }
        
        // Take only the last $lines
        $output = array_slice($output, -$lines);
        
        fclose($file);
        
        return implode("\n", $output);
    }
}