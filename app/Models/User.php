<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Casts\AsCollection;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'discord_id', 'pterodactyl_id', 'pterodactyl_email',
        'limits', 'resources', 'rank', 'coins', 'purchases_plans'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'limits' => 'array',
        'resources' => 'array',
        'purchases_plans' => 'array',
    ];

    // Add this method to initialize default values when a user is created
    protected static function booted()
    {
        static::creating(function ($user) {
            if (!$user->limits) {
                $user->limits = [
                    'cpu' => (int) env('INITIAL_CPU', 750),
                    'memory' => (int) env('INITIAL_MEMORY', 1500),
                    'disk' => (int) env('INITIAL_DISK', 3024),
                    'servers' => (int) env('INITIAL_SERVERS', 1),
                    'databases' => (int) env('INITIAL_DATABASES', 0),
                    'backups' => (int) env('INITIAL_BACKUPS', 0),
                    'allocations' => (int) env('INITIAL_ALLOCATIONS', 2),
                ];
            }

            if (!$user->resources) {
                $user->resources = [
                    'cpu' => 0,
                    'memory' => 0,
                    'disk' => 0,
                    'databases' => 0,
                    'allocations' => 0,
                    'backups' => 0,
                    'servers' => 0,
                ];
            }

            if (!$user->purchases_plans) {
                $user->purchases_plans = [];
            }

            if (!$user->rank) {
                $user->rank = 'free';
            }

            if (!$user->coins) {
                $user->coins = 0;
            }
        });

        // Also handle retrieved event to fix existing users
        static::retrieved(function ($user) {
            $dirty = false;

            if ($user->limits === null) {
                $user->limits = [
                    'cpu' => (int) env('INITIAL_CPU', 750),
                    'memory' => (int) env('INITIAL_MEMORY', 1500),
                    'disk' => (int) env('INITIAL_DISK', 3024),
                    'servers' => (int) env('INITIAL_SERVERS', 1),
                    'databases' => (int) env('INITIAL_DATABASES', 0),
                    'backups' => (int) env('INITIAL_BACKUPS', 0),
                    'allocations' => (int) env('INITIAL_ALLOCATIONS', 2),
                ];
                $dirty = true;
            }

            if ($user->resources === null) {
                $user->resources = [
                    'cpu' => 0,
                    'memory' => 0,
                    'disk' => 0,
                    'databases' => 0,
                    'allocations' => 0,
                    'backups' => 0,
                    'servers' => 0,
                ];
                $dirty = true;
            }

            if ($user->purchases_plans === null) {
                $user->purchases_plans = [];
                $dirty = true;
            }

            if ($user->rank === null) {
                $user->rank = 'free';
                $dirty = true;
            }

            if ($user->coins === null) {
                $user->coins = 0;
                $dirty = true;
            }

            if ($dirty) {
                $user->save();
            }
        });
    }

    /**
 * Check if the user has enough allocation slots available
 *
 * @param int $required Number of allocation slots required
 * @return bool
 */
public function hasEnoughAllocations(int $required): bool
{
    // Make sure resources and limits are properly initialized
    if (!isset($this->limits['allocations']) || !isset($this->resources['allocations'])) {
        return false;
    }
    
    $available = $this->limits['allocations'] - $this->resources['allocations'];
    return $available >= $required;
}
}