<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
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
        'resources' => 'array',
        'redirect' => 'array',
        'perCustomer' => 'array',
        'kushiConfig' => 'array',
    ];
}