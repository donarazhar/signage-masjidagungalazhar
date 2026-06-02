<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;
use App\Models\Traits\ScopedToMosque;

class Event extends Model
{
    use ScopedToMosque;

    protected $fillable = [
        'title',
        'event_date',
        'event_time',
        'description',
        'location',
        'is_enabled',
        'created_by',
        'mosque_id',
    ];

    public function mosque(): BelongsTo
    {
        return $this->belongsTo(Mosque::class);
    }

    protected $casts = [
        'event_date' => 'date',
        'is_enabled' => 'boolean',
    ];

    protected $appends = ['formatted_date', 'formatted_time'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for upcoming events
     */
    public function scopeUpcoming($query, $limit = 5)
    {
        return $query->where('is_enabled', true)
            ->where('event_date', '>=', Carbon::today())
            ->orderBy('event_date', 'asc')
            ->orderBy('event_time', 'asc')
            ->limit($limit);
    }

    /**
     * Get formatted date
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->event_date->translatedFormat('l, d M Y');
    }

    /**
     * Get formatted time
     */
    public function getFormattedTimeAttribute(): ?string
    {
        if (!$this->event_time) {
            return null;
        }
        return Carbon::parse($this->event_time)->format('H:i');
    }
}
