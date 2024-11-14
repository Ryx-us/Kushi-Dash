<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'price',
        'icon',
        'image',
        'description',
        'resources',
        'discount',
        'visibility',
        'redirect',
        'perCustomer',
        'planType',
        'perPerson',
        'stock',
        'kushiConfig',
    ];

    protected $casts = [
        'resources' => 'array',       // Keep this as 'array' if it's a JSON object/array
        'redirect' => 'string',       // Assuming 'redirect' is a URL or string path
        'perCustomer' => 'integer',   // Cast as 'integer' if it's a numeric field
        'kushiConfig' => 'array',     // Keep this as 'array' if it's a JSON object/array
    ];
}
