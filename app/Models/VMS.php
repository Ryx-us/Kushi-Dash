<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VMS extends Model
{
    protected $fillable = [
        'name',
        'description',
        'egg_id',
        'nest_id',
        'image_url',
        'icon',
        'rank',
        'is_enabled'
    ];

    protected $casts = [
        'is_enabled' => 'boolean'
    ];
}