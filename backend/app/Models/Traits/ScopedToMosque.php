<?php

namespace App\Models\Traits;

use App\Models\Scopes\MosqueScope;

trait ScopedToMosque
{
    /**
     * Boot the scoped-to-mosque trait for a model.
     *
     * @return void
     */
    protected static function bootScopedToMosque()
    {
        static::addGlobalScope(new MosqueScope);
    }
}
