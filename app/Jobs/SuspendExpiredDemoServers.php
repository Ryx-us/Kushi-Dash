<?php


namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\DemoServer;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SuspendExpiredDemoServers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Settings to prevent infinite retries
    public $tries = 3;
    public $backoff = 10;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(PterodactylService $pterodactylService): void
    {
        $startTime = microtime(true);
        
        // Add debug logging to see if the job is running
        Log::info('SuspendExpiredDemoServers job started');

        try {
            $expiredServers = DemoServer::where('expires_at', '<', now())
                ->where('is_suspended', false)
                ->get();

            Log::info("Found expired demo servers", [
                'count' => $expiredServers->count()
            ]);

            foreach ($expiredServers as $demoServer) {
                try {
                    // Suspend the server
                    $pterodactylService->suspendServer($demoServer->server_id);
                    
                    // Update the demo server record
                    $demoServer->is_suspended = true;
                    $demoServer->save();
                    
                    Log::info("Demo server suspended", [
                        'server_id' => $demoServer->server_id,
                        'user_id' => $demoServer->user_id,
                        'expired_at' => $demoServer->expires_at
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to suspend demo server", [
                        'server_id' => $demoServer->server_id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            // Update the cache to indicate when the job was last run
            Cache::put('last_demo_server_check', now(), 3600); // 1 hour
            
            $endTime = microtime(true);
            $executionTime = round(($endTime - $startTime) * 1000, 2);
            
            Log::info("SuspendExpiredDemoServers job completed in {$executionTime}ms");
            
        } catch (\Exception $e) {
            Log::error('Failed to check expired demo servers: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
    
    /**
     * Static method to dispatch the job if needed (can be called from anywhere)
     */
    public static function dispatchIfNeeded()
    {
        $cacheKey = 'last_demo_server_check';
        
        // Only check once per hour to avoid excessive job dispatching
        if (!Cache::has($cacheKey)) {
            self::dispatch();
            Log::info("Dispatched SuspendExpiredDemoServers job");
            
            // We'll let the actual job update the cache when it completes
        }
    }
}