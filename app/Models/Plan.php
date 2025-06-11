<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description', 
        'price',
        'features',  // Keep this since it exists in DB
        'icon',
        'image',
        'resources',
        'discount',
        'visibility',
        'redirect',
        'perCustomer', // Keep this since it exists in DB
        'planType',
        'perPerson', // Keep this since it exists in DB
        'stock',
        'kushiConfig', // Keep this since it exists in DB
        'maxUsers', // Adding this new column
        'duration', // Adding this new column
    ];

    protected $casts = [
        'resources' => 'array',
        'visibility' => 'boolean',
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'features' => 'array',
        'kushiConfig' => 'array',
    ];

    /**
     * Get subscriptions for this plan.
     */
    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }
}