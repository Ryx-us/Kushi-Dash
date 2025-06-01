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
        'email_verified_at' => 'datetime',
        'resources' => 'array',
        'limits' => 'array',
        'purchases_plans' => 'array',
    ];

    /**
     * Convert the user to a Vue-friendly object.
     *
     * @return array
     */
    public function toVueObject()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'coins' => $this->coins,
            'resources' => $this->resources,
            'limits' => $this->limits,
            'rank' => $this->rank,
            'purchases_plans' => $this->purchases_plans,
            'discord_id' => $this->discord_id,
            'pterodactyl_id' => $this->pterodactyl_id,
            'pterodactyl_email' => $this->pterodactyl_email,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'is_admin' => $this->isAdmin(),
        ];
    }

    /**
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin()
    {
        return $this->rank === 'admin';
    }

    /**
     * Get the pterodactyl user ID.
     *
     * @return int|null
     */
    public function getPterodactylId()
    {
        return $this->pterodactyl_id;
    }

    /**
     * Get the user's available resources.
     *
     * @return array
     */
    public function getResources()
    {
        return $this->resources ?? [
            'cpu' => 0,
            'memory' => 0,
            'disk' => 0,
            'slots' => 0,
        ];
    }

    /**
     * Get the user's resource limits.
     *
     * @return array
     */
    public function getLimits()
    {
        return $this->limits ?? [
            'cpu' => 0,
            'memory' => 0,
            'disk' => 0,
            'slots' => 0,
        ];
    }

    /**
     * Get the user's purchased plans.
     *
     * @return array
     */
    public function getPurchasedPlans()
    {
        return $this->purchases_plans ?? [];
    }

    /**
     * Check if the user has sufficient coins for a purchase.
     *
     * @param int $amount
     * @return bool
     */
    public function hasSufficientCoins($amount)
    {
        return $this->coins >= $amount;
    }

    /**
     * Deduct coins from the user's balance.
     *
     * @param int $amount
     * @return bool
     */
    public function deductCoins($amount)
    {
        if ($this->hasSufficientCoins($amount)) {
            $this->coins -= $amount;
            $this->save();
            return true;
        }
        return false;
    }

    /**
     * Add coins to the user's balance.
     *
     * @param int $amount
     * @return void
     */
    public function addCoins($amount)
    {
        $this->coins += $amount;
        $this->save();
    }
}