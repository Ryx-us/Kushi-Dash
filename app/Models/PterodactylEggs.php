<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PterodactylEggs extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'EggID',
        'imageUrl',
        'nestId',
        'icon',
        'additional_environmental_variables',
        'plans'
    ];

    protected $casts = [
        'additional_environmental_variables' => 'array',
        'plans' => 'array'
    ];

    

    /**
     * Default available plans
     */
    public static $availablePlans = [
        'basic',
        'premium',
        'enterprise'
    ];
}