<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Mosque extends Model
{
    protected $fillable = ['name', 'slug', 'address', 'city', 'logo'];

    protected $appends = ['logo_url'];

    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug from name if not provided
        static::creating(function ($mosque) {
            if (empty($mosque->slug)) {
                $mosque->slug = Str::slug($mosque->name);
            }
        });

        static::updating(function ($mosque) {
            if (empty($mosque->slug)) {
                $mosque->slug = Str::slug($mosque->name);
            }
        });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function getLogoUrlAttribute()
    {
        if ($this->logo) {
            return asset('storage/' . $this->logo);
        }
        return null;
    }

    /**
     * Find mosque by slug or ID
     */
    public static function findBySlugOrId($identifier)
    {
        // If numeric, search by ID
        if (is_numeric($identifier)) {
            return static::find($identifier);
        }
        // Otherwise search by slug
        return static::where('slug', $identifier)->first();
    }
}
