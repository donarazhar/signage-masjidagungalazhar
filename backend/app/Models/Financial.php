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
        'mosque_id',
    ];

    public function mosque(): BelongsTo
    {
        return $this->belongsTo(Mosque::class);
    }

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
    /**
     * Get weekly summary
     */
    public static function getWeeklySummary(?int $mosqueId = null): array
    {
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        $query = static::whereBetween('record_date', [$startOfWeek, $endOfWeek]);

        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        }

        return $query->orderBy('record_date', 'asc')
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
     * Get total balance (sum of all financials - expenses logic not implemented yet, currently just sum)
     */
    public static function getTotalBalance(?int $mosqueId = null): float
    {
        $query = static::query();
        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        }
        return $query->sum('amount');
    }
}
