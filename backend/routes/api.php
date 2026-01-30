<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\RunningTextController;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PrayerTimeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HadithController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BackupController;

use App\Http\Controllers\Api\MosqueController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (untuk Display Mode)
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/prayer-times', [PrayerTimeController::class, 'today']);
Route::get('/prayer-times/month', [PrayerTimeController::class, 'month']);
Route::get('/prayer-times/cities', [PrayerTimeController::class, 'cities']);
Route::get('/contents/active', [ContentController::class, 'active']);
Route::get('/running-texts/active', [RunningTextController::class, 'active']);
Route::get('/donations/active', [DonationController::class, 'active']);
Route::get('/financials/summary', [FinancialController::class, 'summary']);
Route::get('/events/upcoming', [EventController::class, 'upcoming']);
Route::get('/hadiths/active', [HadithController::class, 'active']);

// Authentication
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Handle unauthenticated API requests (return JSON instead of redirect)
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated'], 401);
})->name('login.get');

// Protected routes (Admin Panel)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Mosques (Super Admin only - permission check in controller or middleware)
    Route::apiResource('mosques', MosqueController::class);
    Route::apiResource('users', UserController::class);

    // Settings
    Route::put('/settings/bulk', [SettingController::class, 'bulkUpdate']);
    Route::get('/settings/{key}', [SettingController::class, 'show']);
    Route::put('/settings/{key}', [SettingController::class, 'update']);
    Route::post('/settings/logo', [SettingController::class, 'uploadLogo']);
    Route::delete('/settings/logo', [SettingController::class, 'deleteLogo']);

    // Contents
    Route::get('/contents', [ContentController::class, 'index']);
    Route::post('/contents', [ContentController::class, 'store']);
    Route::put('/contents/{content}', [ContentController::class, 'update']);
    Route::delete('/contents/{content}', [ContentController::class, 'destroy']);
    Route::put('/contents/{content}/toggle', [ContentController::class, 'toggle']);
    Route::put('/contents/reorder', [ContentController::class, 'reorder']);

    // Running Texts
    Route::get('/running-texts', [RunningTextController::class, 'index']);
    Route::post('/running-texts', [RunningTextController::class, 'store']);
    Route::put('/running-texts/{runningText}', [RunningTextController::class, 'update']);
    Route::delete('/running-texts/{runningText}', [RunningTextController::class, 'destroy']);
    Route::put('/running-texts/{runningText}/toggle', [RunningTextController::class, 'toggle']);

    // Financials
    Route::get('/financials', [FinancialController::class, 'index']);
    Route::post('/financials', [FinancialController::class, 'store']);
    Route::put('/financials/{financial}', [FinancialController::class, 'update']);
    Route::delete('/financials/{financial}', [FinancialController::class, 'destroy']);

    // Events
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);
    Route::put('/events/{event}/toggle', [EventController::class, 'toggle']);

    // Donations
    Route::get('/donations', [DonationController::class, 'index']);
    Route::post('/donations', [DonationController::class, 'store']);
    Route::put('/donations/{donation}', [DonationController::class, 'update']);
    Route::delete('/donations/{donation}', [DonationController::class, 'destroy']);
    Route::put('/donations/{donation}/toggle', [DonationController::class, 'toggle']);

    // Hadiths
    Route::get('/hadiths', [HadithController::class, 'index']);
    Route::post('/hadiths', [HadithController::class, 'store']);
    Route::put('/hadiths/{hadith}', [HadithController::class, 'update']);
    Route::delete('/hadiths/{hadith}', [HadithController::class, 'destroy']);
    Route::put('/hadiths/{hadith}/toggle', [HadithController::class, 'toggle']);

    // Activity Logs (Super Admin)
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/action-types', [ActivityLogController::class, 'actionTypes']);
    Route::get('/activity-logs/stats', [ActivityLogController::class, 'stats']);
    Route::get('/activity-logs/export', [ActivityLogController::class, 'export']);

    // Backups (Super Admin)
    Route::get('/backups', [BackupController::class, 'index']);
    Route::post('/backups', [BackupController::class, 'create']);
    Route::get('/backups/{filename}/download', [BackupController::class, 'download']);
    Route::delete('/backups/{filename}', [BackupController::class, 'destroy']);
});
