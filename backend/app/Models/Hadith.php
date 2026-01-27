<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hadith extends Model
{
    protected $fillable = ['content', 'source', 'is_active', 'mosque_id'];

    public function mosque()
    {
        return $this->belongsTo(Mosque::class);
    }

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
