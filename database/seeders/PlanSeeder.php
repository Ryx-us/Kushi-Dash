<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;
use Carbon\Carbon; // Move this statement outside of the class method

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::create([
            'name' => 'Test Plan',
            'description' => 'This is a test plan for development purposes.',
            'price' => 19.99,
            'duration' => 30,
            'type' => 'Test Type',
            'platform' => 'PTERODACTYL',
            'resources' => json_encode([ 
                'cpu' => 2,
                'memory' => 4096,
                'disk' => 8192,
                'swap' => -1,
                'io' => 500,
                'threads' => 1,
                'allocations' => 0,
                'databases' => 0,
                'backups' => 0
            ]),
            'transferrableTo' => json_encode(['UserGroup1']),
            'image' => 'https://example.com/image.png',
            'icon' => json_encode(['icon1.png', 'icon2.png']),
            'invisible' => false,
            'availableIn' => '', // Example of a datetime string
            'availableUntil' => Carbon::parse('2024-12-31')->toDateString(), // Example of a date string

            'amountAllowedPerCustomer' => 2,
            'stock' => 50,
            'renewable' => true,
            'productContent' => json_encode(['feature1' => 'value1']),
            'billingCycles' => json_encode([ 
                'monthly' => [
                    'cpu' => 10,
                    'memory' => 128,
                    'disk' => 128,
                    'swap' => -1,
                    'io' => 500,
                    'threads' => 1,
                    'allocations' => 0,
                    'databases' => 0,
                    'backups' => 0
                ]
            ]),

            'purchases' => 0,
            'discordRole' => 'RoleID123',
            'category' => 'Test Category',
            'recurrentResources' => false,
            'strikeThroughPrice' => 29.99,
        ]);
    }
}


