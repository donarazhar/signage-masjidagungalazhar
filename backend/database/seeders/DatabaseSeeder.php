<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin user
        User::create([
            'name' => 'Admin Masjid',
            'email' => 'admin@masjid.local',
            'password' => Hash::make('password'),
        ]);

        // Create default settings
        $defaultSettings = [
            ['key' => 'mosque_name', 'value' => 'Masjid Agung Al Azhar', 'type' => 'string'],
            ['key' => 'mosque_address', 'value' => 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan', 'type' => 'string'],
            ['key' => 'latitude', 'value' => '-6.2088', 'type' => 'number'],
            ['key' => 'longitude', 'value' => '106.8456', 'type' => 'number'],
            ['key' => 'city', 'value' => 'Jakarta', 'type' => 'string'],
            ['key' => 'calculation_method', 'value' => '20', 'type' => 'number'], // Kemenag
            ['key' => 'iqamah_duration', 'value' => json_encode([
                'fajr' => 10,
                'dhuhr' => 10,
                'asr' => 10,
                'maghrib' => 5,
                'isha' => 10,
            ]), 'type' => 'json'],
            ['key' => 'prayer_duration', 'value' => '15', 'type' => 'number'],
            ['key' => 'countdown_before', 'value' => '15', 'type' => 'number'],
            ['key' => 'carousel_duration', 'value' => '10', 'type' => 'number'],
            ['key' => 'running_text_speed', 'value' => '80', 'type' => 'number'],
            ['key' => 'show_hijri_date', 'value' => 'true', 'type' => 'boolean'],
            ['key' => 'theme', 'value' => 'dark', 'type' => 'string'],
        ];

        foreach ($defaultSettings as $setting) {
            Setting::create($setting);
        }
    }
}
