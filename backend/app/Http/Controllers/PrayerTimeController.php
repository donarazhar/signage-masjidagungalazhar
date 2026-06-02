<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Mosque;
use App\Http\Traits\ResolvesMosque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class PrayerTimeController extends Controller
{
    use ResolvesMosque;

    /**
     * Get today's prayer times using MyQuran API (Kemenag RI)
     */
    public function today(Request $request)
    {
        $mosqueId = $this->resolveMosqueId($request);

        // Use city_id for MyQuran API (default: Jakarta = 1301)
        $cityId = Setting::getValue('city_id', '1301', $mosqueId);

        $today = now();
        $cacheKey = "prayer_times_myquran_{$cityId}_" . $today->format('Y-m-d');

        $prayerTimes = Cache::remember($cacheKey, 3600, function () use ($cityId, $today) {
            $response = Http::withoutVerifying()->get("https://api.myquran.com/v2/sholat/jadwal/{$cityId}/{$today->year}/{$today->month}/{$today->day}");

            if ($response->successful()) {
                $data = $response->json()['data'];
                $jadwal = $data['jadwal'];

                $daerah = $data['daerah'] ?? '';
                $timezone = $this->getTimezone($daerah);

                return [
                    'timings' => [
                        'fajr' => $jadwal['subuh'],
                        'sunrise' => $jadwal['terbit'],
                        'dhuha' => $jadwal['dhuha'],
                        'dhuhr' => $jadwal['dzuhur'],
                        'asr' => $jadwal['ashar'],
                        'maghrib' => $jadwal['maghrib'],
                        'isha' => $jadwal['isya'],
                    ],
                    'date' => [
                        'gregorian' => [
                            'date' => $jadwal['date'],
                            'format' => 'YYYY-MM-DD',
                            'day' => $today->day,
                            'weekday' => ['en' => $today->format('l')],
                            'month' => ['number' => $today->month, 'en' => $today->format('F')],
                            'year' => (string) $today->year,
                        ],
                        'hijri' => $this->getHijriDate($today),
                    ],
                    'lokasi' => $data['lokasi'] ?? '',
                    'daerah' => $daerah,
                    'timezone' => $timezone,
                ];
            }

            return null;
        });

        if (!$prayerTimes) {
            return response()->json(['error' => 'Gagal mengambil jadwal shalat'], 500);
        }

        // Get prayer time offsets (in minutes, can be positive or negative)
        $prayerTimeOffset = Setting::getValue('prayer_time_offset', [
            'fajr' => 0,
            'sunrise' => 0,
            'dhuhr' => 0,
            'asr' => 0,
            'maghrib' => 0,
            'isha' => 0,
        ], $mosqueId);

        // Apply offsets to prayer times
        foreach ($prayerTimes['timings'] as $prayer => $time) {
            $offset = $prayerTimeOffset[$prayer] ?? 0;
            if ($offset != 0) {
                $parts = explode(':', $time);
                if (count($parts) >= 2) {
                    $totalMinutes = (int)$parts[0] * 60 + (int)$parts[1] + $offset;
                    // Handle day overflow/underflow
                    if ($totalMinutes < 0) $totalMinutes += 1440;
                    if ($totalMinutes >= 1440) $totalMinutes -= 1440;
                    $hours = floor($totalMinutes / 60);
                    $minutes = $totalMinutes % 60;
                    $prayerTimes['timings'][$prayer] = sprintf('%02d:%02d', $hours, $minutes);
                }
            }
        }

        // Add iqamah durations
        $iqamahDuration = Setting::getValue('iqamah_duration', [
            'fajr' => 10,
            'dhuhr' => 10,
            'asr' => 10,
            'maghrib' => 5,
            'isha' => 10,
        ], $mosqueId);

        $prayerTimes['iqamah_duration'] = $iqamahDuration;
        $prayerTimes['prayer_duration'] = Setting::getValue('prayer_duration', 15, $mosqueId);
        $prayerTimes['countdown_before'] = Setting::getValue('countdown_before', 15, $mosqueId);
        $prayerTimes['prayer_time_offset'] = $prayerTimeOffset;

        return response()->json($prayerTimes);
    }

    /**
     * Get Hijri date approximation
     */
    private function getHijriDate($date)
    {
        // Simple Hijri calculation (approximation)
        $jd = gregoriantojd($date->month, $date->day, $date->year);
        $l = $jd - 1948440 + 10632;
        $n = intval(($l - 1) / 10631);
        $l = $l - 10631 * $n + 354;
        $j = intval((10985 - $l) / 5316) * intval((50 * $l) / 17719) + intval($l / 5670) * intval((43 * $l) / 15238);
        $l = $l - intval((30 - $j) / 15) * intval((17719 * $j) / 50) - intval($j / 16) * intval((15238 * $j) / 43) + 29;
        $m = intval((24 * $l) / 709);
        $d = $l - intval((709 * $m) / 24);
        $y = 30 * $n + $j - 30;

        $hijriMonths = ['', 'Muharram', 'Safar', "Rabi'ul Awal", "Rabi'ul Akhir", 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'];
        $hijriMonthsAr = ['', 'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];

        return [
            'date' => sprintf('%02d-%02d-%04d', $d, $m, $y),
            'format' => 'DD-MM-YYYY',
            'day' => (string) $d,
            'weekday' => ['en' => $date->format('l'), 'ar' => ''],
            'month' => ['number' => $m, 'en' => $hijriMonths[$m] ?? '', 'ar' => $hijriMonthsAr[$m] ?? ''],
            'year' => (string) $y,
        ];
    }

    /**
     * Get Indonesian timezone based on province
     */
    private function getTimezone($daerah)
    {
        // WIT (UTC+9): Maluku, Papua
        $wit = ['MALUKU', 'MALUKU UTARA', 'PAPUA', 'PAPUA BARAT', 'PAPUA TENGAH', 'PAPUA PEGUNUNGAN', 'PAPUA SELATAN', 'PAPUA BARAT DAYA'];

        // WITA (UTC+8): Bali, Nusa Tenggara, Sulawesi, Kalimantan (kecuali Barat & Tengah)
        $wita = [
            'BALI',
            'NUSA TENGGARA BARAT',
            'NUSA TENGGARA TIMUR',
            'SULAWESI UTARA',
            'SULAWESI TENGAH',
            'SULAWESI SELATAN',
            'SULAWESI TENGGARA',
            'SULAWESI BARAT',
            'GORONTALO',
            'KALIMANTAN SELATAN',
            'KALIMANTAN TIMUR',
            'KALIMANTAN UTARA'
        ];

        $daerahUpper = strtoupper($daerah);

        foreach ($wit as $prov) {
            if (str_contains($daerahUpper, $prov)) {
                return ['code' => 'WIT', 'name' => 'Waktu Indonesia Timur', 'offset' => '+09:00'];
            }
        }

        foreach ($wita as $prov) {
            if (str_contains($daerahUpper, $prov)) {
                return ['code' => 'WITA', 'name' => 'Waktu Indonesia Tengah', 'offset' => '+08:00'];
            }
        }

        // Default: WIB (UTC+7) - Sumatra, Java, Kalimantan Barat & Tengah
        return ['code' => 'WIB', 'name' => 'Waktu Indonesia Barat', 'offset' => '+07:00'];
    }

    /**
     * Get list of Indonesian cities for prayer times
     */
    public function cities()
    {
        $cacheKey = 'myquran_cities';

        $cities = Cache::remember($cacheKey, 86400 * 7, function () {
            $response = Http::withoutVerifying()->get('https://api.myquran.com/v2/sholat/kota/semua');

            if ($response->successful()) {
                return $response->json()['data'];
            }

            return [];
        });

        return response()->json($cities);
    }

    /**
     * Get monthly prayer times
     */
    public function month(Request $request)
    {
        $mosqueId = $this->resolveMosqueId($request);
        $cityId = Setting::getValue('city_id', '1301', $mosqueId);
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $cacheKey = "prayer_times_month_myquran_{$cityId}_{$year}_{$month}";

        $monthlyTimes = Cache::remember($cacheKey, 86400, function () use ($cityId, $month, $year) {
            $response = Http::withoutVerifying()->get("https://api.myquran.com/v2/sholat/jadwal/{$cityId}/{$year}/{$month}");

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
