<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'mosque_id',
        'action',
        'model_type',
        'model_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the mosque related to this activity
     */
    public function mosque(): BelongsTo
    {
        return $this->belongsTo(Mosque::class);
    }

    /**
     * Log an activity
     */
    public static function log(
        string $action,
        string $description,
        ?string $modelType = null,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        $user = Auth::user();
        
        return self::create([
            'user_id' => $user?->id,
            'mosque_id' => $user?->mosque_id,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }

    /**
     * Log a login action
     */
    public static function logLogin(): self
    {
        return self::log('login', 'User logged in');
    }

    /**
     * Log a logout action
     */
    public static function logLogout(): self
    {
        return self::log('logout', 'User logged out');
    }

    /**
     * Log a create action
     */
    public static function logCreate(Model $model, string $description = null): self
    {
        $modelName = class_basename($model);
        return self::log(
            'create',
            $description ?? "Created new {$modelName}",
            get_class($model),
            $model->id,
            null,
            $model->toArray()
        );
    }

    /**
     * Log an update action
     */
    public static function logUpdate(Model $model, array $oldValues, string $description = null): self
    {
        $modelName = class_basename($model);
        return self::log(
            'update',
            $description ?? "Updated {$modelName}",
            get_class($model),
            $model->id,
            $oldValues,
            $model->toArray()
        );
    }

    /**
     * Log a delete action
     */
    public static function logDelete(Model $model, string $description = null): self
    {
        $modelName = class_basename($model);
        return self::log(
            'delete',
            $description ?? "Deleted {$modelName}",
            get_class($model),
            $model->id,
            $model->toArray(),
            null
        );
    }

    /**
     * Log a backup action
     */
    public static function logBackup(string $filename): self
    {
        return self::log(
            'backup',
            "Created backup: {$filename}",
            null,
            null,
            null,
            ['filename' => $filename]
        );
    }

    /**
     * Log a restore action
     */
    public static function logRestore(string $filename): self
    {
        return self::log(
            'restore',
            "Restored from backup: {$filename}",
            null,
            null,
            null,
            ['filename' => $filename]
        );
    }
}
