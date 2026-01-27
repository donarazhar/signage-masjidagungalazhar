<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Super Admin
        \App\Models\User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
            'mosque_id' => null,
        ]);

        // 2. Create 4 Mosques and their Admins
        $mosques = [
            'Masjid Al-Ikhlas',
            'Masjid An-Nur',
            'Masjid At-Taqwa',
            'Masjid Baiturrahman',
        ];

        foreach ($mosques as $index => $mosqueName) {
            // Create Mosque
            $mosque = \App\Models\Mosque::create([
                'name' => $mosqueName,
                'address' => null, // Empty as requested
                'city' => null,    // Empty as requested
            ]);

            // Create Admin for the Mosque
            \App\Models\User::create([
                'name' => 'Admin ' . $mosqueName,
                'email' => 'admin.masjid' . ($index + 1) . '@example.com',
                'password' => bcrypt('password'),
                'role' => 'admin_masjid',
                'mosque_id' => $mosque->id,
            ]);

            // Create Settings for the Mosque
            $this->createSettingsForMosque($mosque->id);
        }
    }

    private function createSettingsForMosque($mosqueId)
    {
        $defaultSettings = [
            ['key' => 'mosque_name', 'value' => '', 'type' => 'string'], // Empty
            ['key' => 'mosque_address', 'value' => '', 'type' => 'string'], // Empty
            ['key' => 'latitude', 'value' => '', 'type' => 'number'], // Empty
            ['key' => 'longitude', 'value' => '', 'type' => 'number'], // Empty
            ['key' => 'city', 'value' => '', 'type' => 'string'], // Empty
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
            \App\Models\Setting::create([
                ...$setting,
                'mosque_id' => $mosqueId
            ]);
        }
    }
}
