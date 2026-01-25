<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

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
            'value' => 'required',
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
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'sometimes|in:string,json,number,boolean',
        ]);

        foreach ($request->settings as $setting) {
            $type = $setting['type'] ?? 'string';
            Setting::setValue($setting['key'], $setting['value'], $type);
        }

        return response()->json([
            'message' => 'Settings berhasil diperbarui',
            'settings' => Setting::getAllSettings(),
        ]);
    }
}
