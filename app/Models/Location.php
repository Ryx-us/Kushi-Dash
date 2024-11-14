<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location', // Add this
        'servers',
        'flag',
        'maxservers',
        'latencyurl',
        'requiredRank',
        'maintenance',
        'requiredSubscriptions',
        'coinRenewal',
        'platform',
        'platform_settings'
    ];

    protected $casts = [
        'requiredSubscriptions' => 'json', // Changed from 'array' to 'json'
        'coinRenewal' => 'string',
        'platform_settings' => 'json',  // Also change this to be consistent
        'maintenance' => 'boolean',
        'servers' => 'integer',
        'maxservers' => 'integer',
        'requiredRank' => 'string'
    ];

    protected $attributes = [
        'maintenance' => false,
        'servers' => 0,
        'requiredRank' => 0,
        'coinRenewal' => [
            'amount' => 0,
            'hours' => 0,
            'exceptions' => []
        ],
        'platform' => 'PTERODACTYL',
        'platform_settings' => [
            'pid' => 1,
            'swap' => -1,
            'io' => 500,
            'threads' => ''
        ]
    ];
}