<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Content extends Model
{
    protected $fillable = [
        'title',
        'type',
        'file_path',
        'youtube_url',
        'youtube_id',
        'duration',
        'priority',
        'is_enabled',
        'start_date',
        'end_date',
        'show_on_days',
        'uploaded_by',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'show_on_days' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $appends = ['file_url', 'youtube_embed_url', 'youtube_thumbnail'];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scope to get active contents for display
     */
    public function scopeActive($query)
    {
        $today = Carbon::today();
        $dayOfWeek = $today->dayOfWeek;

        return $query->where('is_enabled', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $today);
            })
            ->where(function ($q) use ($dayOfWeek) {
                $q->whereNull('show_on_days')
                    ->orWhereJsonContains('show_on_days', $dayOfWeek);
            })
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get full URL for the file
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get YouTube embed URL
     */
    public function getYoutubeEmbedUrlAttribute(): ?string
    {
        if (!$this->youtube_id) {
            return null;
        }
        return "https://www.youtube.com/embed/{$this->youtube_id}?autoplay=1&mute=1&controls=0&loop=1&playlist={$this->youtube_id}";
    }

    /**
     * Get YouTube thumbnail URL
     */
    public function getYoutubeThumbnailAttribute(): ?string
    {
        if (!$this->youtube_id) {
            return null;
        }
        return "https://img.youtube.com/vi/{$this->youtube_id}/maxresdefault.jpg";
    }
}
