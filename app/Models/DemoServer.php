<?php

/***
 * Demo Servers are servers that are created for users to test the platform.
 * They are temporary and have an expiration date.
 * These servers will be suspended after 48 hours by default.
 */


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemoServer extends Model
{
    use HasFactory;

    protected $fillable = [
        'server_id',
        'user_id',
        'expires_at',
        'server_identifier',
        'is_suspended',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_suspended' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }
}