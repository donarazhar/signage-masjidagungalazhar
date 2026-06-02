<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Traits\ScopedToMosque;

class Donation extends Model
{
    use HasFactory, ScopedToMosque;

    protected $fillable = [
        'type',
        'bank_name',
        'account_number',
        'account_name',
        'logo_path',
        'qris_image',
        'is_active',
        'priority',
        'mosque_id',
    ];

    public function mosque()
    {
        return $this->belongsTo(Mosque::class);
    }

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];
}
