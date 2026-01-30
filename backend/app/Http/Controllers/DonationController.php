<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\ActivityLog;
use App\Http\Traits\ResolvesMosque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DonationController extends Controller
{
    use ResolvesMosque;

    public function index()
    {
        return response()->json(Donation::orderBy('priority', 'desc')->get());
    }

    public function active(Request $request)
    {
        $query = Donation::where('is_active', true)->orderBy('priority', 'desc');

        $mosqueId = $this->resolveMosqueId($request);
        if ($mosqueId) {
            // Get donations for this mosque OR global donations (mosque_id = null)
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
            'type' => 'required|in:rekening,qris',
            'bank_name' => 'nullable|string',
            'account_number' => 'nullable|string',
            'account_name' => 'nullable|string',
            'logo_path' => 'nullable|string',
            'qris_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'priority' => 'integer',
        ]);

        // Handle QRIS image upload
        if ($request->hasFile('qris_image')) {
            $path = $request->file('qris_image')->store('qris', 'public');
            $validated['qris_image'] = $path;
        }

        $validated['mosque_id'] = $request->user()->mosque_id;
        $donation = Donation::create($validated);

        // Log the activity
        $description = $donation->type === 'rekening' 
            ? "Menambahkan rekening donasi: {$donation->bank_name} - {$donation->account_number}" 
            : "Menambahkan QRIS donasi";
        ActivityLog::logCreate($donation, $description);

        return response()->json($donation, 201);
    }

    public function update(Request $request, Donation $donation)
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:rekening,qris',
            'bank_name' => 'nullable|string',
            'account_number' => 'nullable|string',
            'account_name' => 'nullable|string',
            'logo_path' => 'nullable|string',
            'qris_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'priority' => 'integer',
            'is_active' => 'boolean',
        ]);

        // Handle QRIS image upload
        if ($request->hasFile('qris_image')) {
            // Delete old image if exists
            if ($donation->qris_image) {
                Storage::disk('public')->delete($donation->qris_image);
            }
            $path = $request->file('qris_image')->store('qris', 'public');
            $validated['qris_image'] = $path;
        }

        $oldValues = $donation->toArray();
        $donation->update($validated);

        // Log the activity
        // Determine description based on current type or if it changed
        $type = $validated['type'] ?? $donation->type;
        $descType = $type === 'rekening' ? "rekening" : "QRIS";
        ActivityLog::logUpdate($donation, $oldValues, "Memperbarui data {$descType} donasi");

        return response()->json($donation);
    }

    public function destroy(Donation $donation)
    {
        // Log before delete
        $descType = $donation->type === 'rekening' ? "rekening" : "QRIS";
        ActivityLog::logDelete($donation, "Menghapus {$descType} donasi");

        // Delete QRIS image if exists
        if ($donation->qris_image) {
            Storage::disk('public')->delete($donation->qris_image);
        }
        $donation->delete();
        return response()->json(['message' => 'Donation info deleted']);
    }

    public function toggle(Donation $donation)
    {
        $oldStatus = $donation->is_active;
        $donation->update(['is_active' => !$donation->is_active]);

        // Log the toggle action
        $action = $donation->is_active ? 'mengaktifkan' : 'menonaktifkan';
        $descType = $donation->type === 'rekening' ? "rekening" : "QRIS";
        ActivityLog::log('update', "Mengubah status {$descType} donasi ({$action})", Donation::class, $donation->id, ['is_active' => $oldStatus], ['is_active' => $donation->is_active]);

        return response()->json($donation);
    }
}
