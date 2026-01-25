<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    // ...

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

            Setting::setValue($key, $value, $type);
        }

        return response()->json([
            'message' => 'Settings berhasil diperbarui',
            'settings' => Setting::getAllSettings(),
        ]);
    }
}
