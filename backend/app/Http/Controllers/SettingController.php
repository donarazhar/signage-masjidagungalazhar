<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;

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

        foreach ($request->settings as $setting) {
            $type = $setting['type'] ?? 'string';
            $key = $setting['key'];
            $value = $setting['value'];

            Log::info("Saving setting: $key", ['value' => $value, 'type' => $type]);

            $storedValue = match ($type) {
                'json' => is_array($value) || is_object($value) ? json_encode($value) : $value,
                'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false',
                default => (string) $value,
            };

            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $storedValue, 'type' => $type, 'updated_at' => now()]
            );
        }

        return response()->json([
            'message' => 'Settings berhasil diperbarui',
            'settings' => Setting::getAllSettings(),
        ]);
    }
}
