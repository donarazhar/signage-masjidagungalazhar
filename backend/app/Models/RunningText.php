<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class RunningText extends Model
{
    protected $fillable = [
        'content',
        'type',
        'priority',
        'is_enabled',
        'start_date',
        'end_date',
        'show_on_days',
        'created_by',
        'mosque_id',
    ];

    public function mosque(): BelongsTo
    {
        return $this->belongsTo(Mosque::class);
    }

    protected $casts = [
        'is_enabled' => 'boolean',
        'show_on_days' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to get active running texts for display
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
}
