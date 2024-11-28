<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_initializes_limits_resources_and_purchases_plans()
    {
        // Create a user without setting limits, resources, or purchases_plans
        $user = User::factory()->create([
            'limits' => null,
            'resources' => null,
            'purchases_plans' => null,
        ]);

        // Retrieve the user to trigger the retrieved event
        $retrievedUser = User::find($user->id);

        // Assert that the limits are initialized correctly
        $this->assertEquals([
            'cpu' => env('INITIAL_CPU', 80),
            'memory' => env('INITIAL_MEMORY', 2048),
            'disk' => env('INITIAL_DISK', 5120),
            'servers' => env('INITIAL_SERVERS', 1),
            'databases' => env('INITIAL_DATABASES', 0),
            'backups' => env('INITIAL_BACKUPS', 0),
            'allocations' => env('INITIAL_ALLOCATIONS', 2),
        ], $retrievedUser->limits);

        // Assert that the resources are initialized correctly
        $this->assertEquals([
            'cpu' => 0,
            'memory' => 0,
            'disk' => 0,
            'databases' => 0,
            'allocations' => 0,
            'backups' => 0,
            'servers' => 0,
        ], $retrievedUser->resources);

        // Assert that the purchases_plans are initialized correctly
        $this->assertEquals([], $retrievedUser->purchases_plans);
    }
}