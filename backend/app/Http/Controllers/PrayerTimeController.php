<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PrayerTimeController extends Controller
{
    /**
     * Get today's prayer times
     */
    public function today()
    {
        $latitude = Setting::getValue('latitude', -6.2088);
        $longitude = Setting::getValue('longitude', 106.8456);
        $method = Setting::getValue('calculation_method', 20); // 20 = Kemenag

        $cacheKey = "prayer_times_{$latitude}_{$longitude}_{$method}_" . now()->format('Y-m-d');

        $prayerTimes = Cache::remember($cacheKey, 3600, function () use ($latitude, $longitude, $method) {
            $response = Http::get('https://api.aladhan.com/v1/timings', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'method' => $method,
            ]);

            if ($response->successful()) {
                $data = $response->json()['data'];
                return [
                    'timings' => [
                        'fajr' => $data['timings']['Fajr'],
                        'sunrise' => $data['timings']['Sunrise'],
                        'dhuhr' => $data['timings']['Dhuhr'],
                        'asr' => $data['timings']['Asr'],
                        'maghrib' => $data['timings']['Maghrib'],
                        'isha' => $data['timings']['Isha'],
                    ],
                    'date' => [
                        'gregorian' => $data['date']['gregorian'],
                        'hijri' => $data['date']['hijri'],
                    ],
                ];
            }

            return null;
        });

        if (!$prayerTimes) {
            return response()->json(['error' => 'Gagal mengambil jadwal shalat'], 500);
        }

        // Add iqamah durations
        $iqamahDuration = Setting::getValue('iqamah_duration', [
            'fajr' => 10,
            'dhuhr' => 10,
            'asr' => 10,
            'maghrib' => 5,
            'isha' => 10,
        ]);

        $prayerTimes['iqamah_duration'] = $iqamahDuration;
        $prayerTimes['prayer_duration'] = Setting::getValue('prayer_duration', 15);
        $prayerTimes['countdown_before'] = Setting::getValue('countdown_before', 15);

        return response()->json($prayerTimes);
    }

    /**
     * Get monthly prayer times
     */
    public function month(Request $request)
    {
        $latitude = Setting::getValue('latitude', -6.2088);
        $longitude = Setting::getValue('longitude', 106.8456);
        $method = Setting::getValue('calculation_method', 20);
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $cacheKey = "prayer_times_month_{$latitude}_{$longitude}_{$method}_{$year}_{$month}";

        $monthlyTimes = Cache::remember($cacheKey, 86400, function () use ($latitude, $longitude, $method, $month, $year) {
            $response = Http::get('https://api.aladhan.com/v1/calendar', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'method' => $method,
                'month' => $month,
                'year' => $year,
            ]);

            if ($response->successful()) {
                return $response->json()['data'];
            }

            return null;
        });

        if (!$monthlyTimes) {
            return response()->json(['error' => 'Gagal mengambil jadwal shalat bulanan'], 500);
        }

        return response()->json($monthlyTimes);
    }
}
