<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'mosque_id'];

    public function mosque()
    {
        return $this->belongsTo(Mosque::class);
    }

    /**
     * Get a setting value by key, scoped to mosque
     */
    public static function getValue(string $key, mixed $default = null, ?int $mosqueId = null): mixed
    {
        // Ideally pass mosqueId explicitly, or resolve from request specific logic in Controller/Service.
        // For static helper, we might need to rely on passed argument.

        $query = static::where('key', $key);

        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        } else {
            // Fallback or global setting logic if needed, or enforce mosqueId
            $query->whereNull('mosque_id');
        }

        $setting = $query->first();

        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'json' => json_decode($setting->value, true),
            'number' => (float) $setting->value,
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            default => $setting->value,
        };
    }

    /**
     * Set a setting value by key, scoped to mosque
     */
    public static function setValue(string $key, mixed $value, string $type = 'string', ?int $mosqueId = null): static
    {
        $storedValue = match ($type) {
            'json' => json_encode($value),
            'boolean' => $value ? 'true' : 'false',
            default => (string) $value,
        };

        return static::updateOrCreate(
            ['key' => $key, 'mosque_id' => $mosqueId],
            ['value' => $storedValue, 'type' => $type]
        );
    }

    /**
     * Get all settings as key-value array, scoped to mosque
     */
    public static function getAllSettings(?int $mosqueId = null): array
    {
        $settings = [];

        $query = static::query();
        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        } else {
            $query->whereNull('mosque_id');
        }

        foreach ($query->get() as $setting) {
            $settings[$setting->key] = match ($setting->type) {
                'json' => json_decode($setting->value, true),
                'number' => (float) $setting->value,
                'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                default => $setting->value,
            };
        }

        return $settings;
    }
}
