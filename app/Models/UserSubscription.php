<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class UserSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'status',
        'expires_at',
        'granted_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
    
    protected $appends = [
        'days_remaining',
    ];

    // Status constants
    const STATUS_ACTIVE = 'active';
    const STATUS_EXPIRED = 'expired';
    const STATUS_CANCELLED = 'cancelled'; // Add the missing constant

    /**
     * Get the user that owns the subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan associated with the subscription.
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
    
    /**
     * Get the user who granted this subscription.
     */
    public function grantedBy()
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    /**
     * Check if subscription is expired.
     */
    public function isExpired()
    {
        return $this->expires_at && Carbon::now()->isAfter($this->expires_at);
    }

    /**
     * Get days remaining until expiration.
     */
    public function getDaysRemainingAttribute()
    {
        if (!$this->expires_at) {
            return null;
        }
        
        return max(0, Carbon::now()->diffInDays($this->expires_at, false));
    }
}