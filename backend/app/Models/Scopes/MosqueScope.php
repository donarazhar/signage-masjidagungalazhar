<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class MosqueScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model)
    {
        // Apply scope only for authenticated API requests
        if (auth('sanctum')->check()) {
            $user = auth('sanctum')->user();
            
            // Only scope for normal admins who belong to a mosque
            // If superadmin doesn't have a mosque_id, they will see all records.
            if ($user->role !== 'superadmin' && $user->mosque_id) {
                $builder->where($model->getTable() . '.mosque_id', $user->mosque_id);
            }
        }
    }
}
