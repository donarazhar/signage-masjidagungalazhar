<?php

namespace App\Http\Controllers;

use App\Models\Donation;
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
            $query->where('mosque_id', $mosqueId);
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

        $donation->update($validated);
        return response()->json($donation);
    }

    public function destroy(Donation $donation)
    {
        // Delete QRIS image if exists
        if ($donation->qris_image) {
            Storage::disk('public')->delete($donation->qris_image);
        }
        $donation->delete();
        return response()->json(['message' => 'Donation info deleted']);
    }

    public function toggle(Donation $donation)
    {
        $donation->update(['is_active' => !$donation->is_active]);
        return response()->json($donation);
    }
}
