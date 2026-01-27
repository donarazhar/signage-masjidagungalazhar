<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

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
