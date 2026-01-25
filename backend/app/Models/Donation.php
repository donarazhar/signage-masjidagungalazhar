<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank_name',
        'account_number',
        'account_name',
        'logo_path',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];
}
