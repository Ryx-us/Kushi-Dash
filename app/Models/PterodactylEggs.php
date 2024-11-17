<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'additional_environmental_variables'
    ];

    protected $casts = [
            'additional_environmental_variables' => 'array', // Add this line so no sex with dogs
        ];

    public static $requiredPlans = [
        'basic',
        'premium',
        'enterprise'
    ];
}
