<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Mosque;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Resolve mosque ID from slug or ID parameter
     */
    private function resolveMosqueId($mosqueParam)
    {
        if (empty($mosqueParam)) {
            return null;
        }

        // If numeric, return as-is
        if (is_numeric($mosqueParam)) {
            return (int) $mosqueParam;
        }

        // Otherwise lookup by slug
        $mosque = Mosque::where('slug', $mosqueParam)->first();
        return $mosque?->id;
    }

    /**
     * Get all settings
     */
    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $mosqueId = null;
        $mosque = null;

        if ($user) {
            $mosqueId = $user->mosque_id;
            $mosque = $user->mosque;
        } else {
            // Support both mosque_id and m parameter (slug)
            $mosqueParam = $request->query('mosque_id') ?? $request->query('m');
            $mosqueId = $this->resolveMosqueId($mosqueParam);
            if ($mosqueId) {
                $mosque = Mosque::find($mosqueId);
            }
        }

        $settings = Setting::getAllSettings($mosqueId);

        if ($mosque) {
            // Priority: Mosque Registry > Setting Database
            $settings['mosque_name'] = $mosque->name;
            $settings['mosque_address'] = $mosque->address ?? $settings['mosque_address'] ?? '';
            $settings['city'] = $mosque->city ?? $settings['city'] ?? '';
            $settings['mosque_logo'] = $mosque->logo_url;
            $settings['mosque_slug'] = $mosque->slug;
        }

        return response()->json($settings);
    }

    /**
     * Get a single setting by key
     */
    public function show(Request $request, string $key)
    {
        $mosqueId = null;
        if ($request->user()) {
            $mosqueId = $request->user()->mosque_id;
        } else {
            $mosqueId = $request->query('mosque_id');
        }

        $value = Setting::getValue($key, null, $mosqueId);

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
        $mosqueId = $request->user()->mosque_id;

        Setting::setValue($key, $request->value, $type, $mosqueId);

        // Sync back to mosques table
        if ($request->user() && $request->user()->mosque) {
            if ($key === 'mosque_name') {
                $request->user()->mosque()->update(['name' => $request->value]);
            }
            if ($key === 'mosque_address') {
                $request->user()->mosque()->update(['address' => $request->value]);
            }
            if ($key === 'city') {
                $request->user()->mosque()->update(['city' => $request->value]);
            }
        }

        // Log the activity
        $oldValue = Setting::getValue($key, null, $mosqueId);
        ActivityLog::log('update', "Memperbarui pengaturan: {$key}", Setting::class, null, ['value' => $oldValue], ['value' => $request->value]);

        return response()->json([
            'message' => 'Setting berhasil diperbarui',
            'key' => $key,
            'value' => Setting::getValue($key, null, $mosqueId),
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

        $mosqueId = $request->user()->mosque_id;

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

            // Update or Create with mosque_id
            $query = DB::table('settings')
                ->where('key', $key);

            if ($mosqueId) {
                $query->where('mosque_id', $mosqueId);
            } else {
                $query->whereNull('mosque_id');
            }

            $exists = $query->exists();

            if ($exists) {
                $query->update([
                    'value' => $storedValue,
                    'type' => $type,
                    'updated_at' => now()
                ]);
                $debug['updates'][$key] = "UPDATED";
            } else {
                DB::table('settings')->insert([
                    'key' => $key,
                    'value' => $storedValue,
                    'type' => $type,
                    'mosque_id' => $mosqueId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                $debug['updates'][$key] = 'INSERTED';
            }

            // Sync specific keys to mosques table
            if ($request->user()->mosque) {
                if ($key === 'mosque_name') {
                    $request->user()->mosque()->update(['name' => $value]);
                }
                if ($key === 'mosque_address') {
                    $request->user()->mosque()->update(['address' => $value]);
                }
                if ($key === 'city') {
                    $request->user()->mosque()->update(['city' => $value]);
                }
            }
        }

        $allSettings = Setting::getAllSettings($mosqueId);

        // Refresh settings from DB state to ensure consistency in response
        if ($request->user() && $request->user()->mosque) {
            // Refresh is not strictly needed if we just updated, but good practice
            $request->user()->mosque->refresh();
            $allSettings['mosque_name'] = $request->user()->mosque->name;
            $allSettings['mosque_address'] = $request->user()->mosque->address;
            $allSettings['city'] = $request->user()->mosque->city;
            $allSettings['mosque_logo'] = $request->user()->mosque->logo_url;
        }

        // Log the activity
        ActivityLog::log('update', "Memperbarui banyak pengaturan sekaligus", Setting::class, null, null, ['keys' => array_keys($debug['updates'])]);

        return response()->json([
            'message' => 'Settings berhasil diperbarui',
            'debug' => $debug,
            'settings' => $allSettings,
        ]);
    }

    /**
     * Upload mosque logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = $request->user();

        if (!$user || !$user->mosque) {
            return response()->json(['error' => 'Masjid tidak ditemukan'], 404);
        }

        $mosque = $user->mosque;

        // Delete old logo if exists
        if ($mosque->logo) {
            Storage::disk('public')->delete($mosque->logo);
        }

        // Store new logo
        $path = $request->file('logo')->store('logos', 'public');
        $mosque->update(['logo' => $path]);

        // Log the activity
        ActivityLog::log('update', "Mengupload logo masjid baru", Mosque::class, $mosque->id, null, ['logo' => $path]);

        return response()->json([
            'message' => 'Logo berhasil diupload',
            'logo_url' => $mosque->logo_url,
        ]);
    }

    /**
     * Delete mosque logo
     */
    public function deleteLogo(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->mosque) {
            return response()->json(['error' => 'Masjid tidak ditemukan'], 404);
        }

        $mosque = $user->mosque;

        if ($mosque->logo) {
            Storage::disk('public')->delete($mosque->logo);
            $mosque->update(['logo' => null]);
        }

        // Log the activity
        ActivityLog::log('delete', "Menghapus logo masjid", Mosque::class, $mosque->id, ['logo' => $mosque->logo], null);

        return response()->json([
            'message' => 'Logo berhasil dihapus',
        ]);
    }
}
