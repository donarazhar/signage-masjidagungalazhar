<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hadith extends Model
{
    protected $fillable = ['content', 'source', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
