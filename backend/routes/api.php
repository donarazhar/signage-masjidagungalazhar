<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\RunningTextController;
use App\Http\Controllers\FinancialController;
use App\Http\Controllers\PrayerTimeController;
use App\Http\Controllers\EventController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (untuk Display Mode)
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/prayer-times', [PrayerTimeController::class, 'today']);
Route::get('/prayer-times/month', [PrayerTimeController::class, 'month']);
Route::get('/contents/active', [ContentController::class, 'active']);
Route::get('/running-texts/active', [RunningTextController::class, 'active']);
Route::get('/financials/summary', [FinancialController::class, 'summary']);
Route::get('/events/upcoming', [EventController::class, 'upcoming']);

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (Admin Panel)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Settings
    Route::put('/settings/bulk', [SettingController::class, 'bulkUpdate']);
    Route::get('/settings/{key}', [SettingController::class, 'show']);
    Route::put('/settings/{key}', [SettingController::class, 'update']);

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
});
