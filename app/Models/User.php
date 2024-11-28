<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use Notifiable;
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'discord_id',
        'pterodactyl_id',
        'pterodactyl_email',
        'coins',
        'resources',
        'limits',
        'rank',
        'purchases_plans',
        'redeem_code',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'redeem_code',
    ];

    protected $casts = [
        'resources' => 'array',
        'limits' => 'array',
        'purchases_plans' => 'array'
    ];

    public static function boot()
    {
        parent::boot();

        static::retrieved(function ($user) {
            if (is_null($user->limits)) {
                $user->limits = [
                    'cpu' => env('INITIAL_CPU', 80),
                    'memory' => env('INITIAL_MEMORY', 2048),
                    'disk' => env('INITIAL_DISK', 5120),
                    'servers' => env('INITIAL_SERVERS', 1),
                    'databases' => env('INITIAL_DATABASES', 0),
                    'backups' => env('INITIAL_BACKUPS', 0),
                    'allocations' => env('INITIAL_ALLOCATIONS', 2),
                ];
                $user->save();
            }

            if (is_null($user->resources)) {
                $user->resources = [
                    'cpu' => 0,
                    'memory' => 0,
                    'disk' => 0,
                    'databases' => 0,
                    'allocations' => 0,
                    'backups' => 0,
                    'servers' => 0,
                ];
                $user->save();
            }
            if (is_null($user->purchases_plans)) {  // Add this
                $user->purchases_plans = [];
                $user->save();
            }
        });
    }

    

    

    public function getIsAdminAttribute()
    {
        return $this->rank === 'admin';
    }

    public function hasEnoughAllocations($requestedPorts = 1)
{
    $availableAllocations = $this->limits['allocations'] - $this->resources['allocations'];
    return $availableAllocations >= $requestedPorts; // Simplified check
}
}
