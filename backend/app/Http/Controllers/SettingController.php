<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        return response()->json(Setting::getAllSettings());
    }

    /**
     * Get a single setting by key
     */
    public function show(string $key)
    {
        $value = Setting::getValue($key);

        if ($value === null) {
            return response()->json(['error' => 'Setting not found'], 404);
        }

        return response()->json([
            'key' => $key,
            'value' => $value,
        ]);
    }

    /**
     * Update a setting
     */
    public function update(Request $request, string $key)
    {
        $request->validate([
            'value' => 'nullable',
            'type' => 'sometimes|in:string,json,number,boolean',
        ]);

        $type = $request->input('type', 'string');

        Setting::setValue($key, $request->value, $type);

        return response()->json([
            'message' => 'Setting berhasil diperbarui',
            'key' => $key,
            'value' => Setting::getValue($key),
        ]);
    }

    /**
     * Bulk update settings
     */
    public function bulkUpdate(Request $request)
    {
        Log::info('Bulk update request:', $request->all());

        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.type' => 'sometimes|in:string,json,number,boolean',
        ]);

        $debug = [];
        $debug['db_connection'] = DB::getDefaultConnection();
        $debug['updates'] = [];

        foreach ($request->settings as $setting) {
            $type = $setting['type'] ?? 'string';
            $key = $setting['key'];
            $value = $setting['value'];

            $storedValue = match ($type) {
                'json' => is_array($value) || is_object($value) ? json_encode($value) : $value,
                'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false',
                default => (string) $value,
            };

            // Force update using raw query builder
            $affected = DB::table('settings')
                ->where('key', $key)
                ->update([
                    'value' => $storedValue,
                    'type' => $type,
                    'updated_at' => now()
                ]);

            if ($affected > 0) {
                $debug['updates'][$key] = "UPDATED ($affected)";
            } else {
                $exists = DB::table('settings')->where('key', $key)->exists();
                if (!$exists) {
                    DB::table('settings')->insert([
                        'key' => $key,
                        'value' => $storedValue,
                        'type' => $type,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    $debug['updates'][$key] = 'INSERTED';
                } else {
                    $debug['updates'][$key] = 'NO CHANGE (identical value)';
                }
            }
        }

        return response()->json([
            'message' => 'Settings berhasil diperbarui',
            'debug' => $debug,
            'settings' => Setting::getAllSettings(),
        ]);
    }
}
