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
        'nestId',
        'imageUrl',
        'icon',
        'additional_environmental_variables',
        'plans',
    ];

    protected $casts = [
        'additional_environmental_variables' => 'array',
        'plans' => 'array',
    ];

    /**
     * Get the additional environmental variables attribute.
     *
     * @param  mixed  $value
     * @return array
     */
    public function getAdditionalEnvironmentalVariablesAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    /**
     * Get the plans attribute.
     *
     * @param  mixed  $value
     * @return array
     */
    public function getPlansAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    /**
     * Set the additional environmental variables attribute.
     *
     * @param  mixed  $value
     * @return void
     */
    public function setAdditionalEnvironmentalVariablesAttribute($value)
    {
        $this->attributes['additional_environmental_variables'] = $value ? json_encode($value) : null;
    }

    /**
     * Set the plans attribute.
     *
     * @param  mixed  $value
     * @return void
     */
    public function setPlansAttribute($value)
    {
        $this->attributes['plans'] = $value ? json_encode($value) : null;
    }
}