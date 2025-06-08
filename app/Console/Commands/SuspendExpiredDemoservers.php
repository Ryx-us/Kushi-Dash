<?php


namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DemoServer;
use App\Services\PterodactylService;
use Illuminate\Support\Facades\Log;

class SuspendExpiredDemoServers extends Command
{
    protected $signature = 'demo:suspend-expired';
    protected $description = 'Suspend all expired demo servers';

    protected $pterodactylService;

    public function __construct(PterodactylService $pterodactylService)
    {
        parent::__construct();
        $this->pterodactylService = $pterodactylService;
    }

    public function handle()
    {
        $expiredServers = DemoServer::where('expires_at', '<', now())
            ->where('is_suspended', false)
            ->get();

        $this->info("Found {$expiredServers->count()} expired demo servers to suspend.");

        foreach ($expiredServers as $demoServer) {
            try {
                // Suspend the server
                $this->pterodactylService->suspendServer($demoServer->server_id);
                
                // Update the demo server record
                $demoServer->is_suspended = true;
                $demoServer->save();
                
                $this->info("Suspended demo server ID: {$demoServer->server_id}");
                Log::info("Demo server suspended", [
                    'server_id' => $demoServer->server_id,
                    'user_id' => $demoServer->user_id,
                    'expired_at' => $demoServer->expires_at
                ]);
            } catch (\Exception $e) {
                $this->error("Failed to suspend demo server ID: {$demoServer->server_id}");
                Log::error("Failed to suspend demo server", [
                    'server_id' => $demoServer->server_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return Command::SUCCESS;
    }
}