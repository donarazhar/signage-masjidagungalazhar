<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Financial extends Model
{
    protected $fillable = [
        'record_date',
        'amount',
        'description',
        'type',
        'recorded_by',
    ];

    protected $casts = [
        'record_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Get weekly summary
     */
    public static function getWeeklySummary(): array
    {
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        return static::whereBetween('record_date', [$startOfWeek, $endOfWeek])
            ->orderBy('record_date', 'asc')
            ->get()
            ->groupBy(fn($item) => $item->record_date->format('Y-m-d'))
            ->map(fn($items) => [
                'date' => $items->first()->record_date->format('Y-m-d'),
                'day_name' => $items->first()->record_date->locale('id')->dayName,
                'total' => $items->sum('amount'),
                'details' => $items->map(fn($item) => [
                    'type' => $item->type,
                    'amount' => $item->amount,
                    'description' => $item->description,
                ])->toArray(),
            ])
            ->values()
            ->toArray();
    }

    /**
     * Get total balance (sum of all financials)
     */
    public static function getTotalBalance(): float
    {
        return static::sum('amount');
    }
}
