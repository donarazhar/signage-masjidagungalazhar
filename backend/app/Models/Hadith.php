<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\ScopedToMosque;

class Hadith extends Model
{
    use ScopedToMosque;

    protected $fillable = ['content', 'source', 'is_active', 'mosque_id'];

    public function mosque()
    {
        return $this->belongsTo(Mosque::class);
    }

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
