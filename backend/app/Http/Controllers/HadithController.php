<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hadith;
use App\Models\ActivityLog;
use App\Http\Traits\ResolvesMosque;

class HadithController extends Controller
{
    use ResolvesMosque;

    public function index()
    {
        return Hadith::orderBy('created_at', 'desc')->get();
    }

    public function active(Request $request)
    {
        // Return all active hadiths for frontend rotation
        $query = Hadith::where('is_active', true)->orderBy('created_at', 'desc');

        $mosqueId = $this->resolveMosqueId($request);
        if ($mosqueId) {
            // Get hadiths for this mosque OR global hadiths (mosque_id = null)
            $query->where(function ($q) use ($mosqueId) {
                $q->where('mosque_id', $mosqueId)
                    ->orWhereNull('mosque_id');
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'source' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $validated['mosque_id'] = $request->user()->mosque_id;
        $hadith = Hadith::create($validated);

        // Log the activity
        ActivityLog::logCreate($hadith, "Menambahkan hadits: " . substr($hadith->content, 0, 50) . "...");

        return response()->json($hadith, 201);
    }

    public function update(Request $request, Hadith $hadith)
    {
        $validated = $request->validate([
            'content' => 'string',
            'source' => 'string',
            'is_active' => 'boolean'
        ]);

        $oldValues = $hadith->toArray();
        $hadith->update($validated);

        // Log the activity
        ActivityLog::logUpdate($hadith, $oldValues, "Memperbarui hadits: " . substr($hadith->content, 0, 50) . "...");

        return response()->json($hadith);
    }

    public function destroy(Hadith $hadith)
    {
        // Log before delete
        ActivityLog::logDelete($hadith, "Menghapus hadits: " . substr($hadith->content, 0, 50) . "...");

        $hadith->delete();
        return response()->json(null, 204);
    }

    public function toggle(Hadith $hadith)
    {
        $oldStatus = $hadith->is_active;
        $hadith->update(['is_active' => !$hadith->is_active]);

        // Log the toggle action
        $action = $hadith->is_active ? 'mengaktifkan' : 'menonaktifkan';
        ActivityLog::log('update', "Mengubah status hadits ({$action})", Hadith::class, $hadith->id, ['is_active' => $oldStatus], ['is_active' => $hadith->is_active]);

        return response()->json($hadith);
    }
}
