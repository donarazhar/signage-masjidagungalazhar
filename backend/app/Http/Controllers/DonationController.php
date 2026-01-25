<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function index()
    {
        return response()->json(Donation::orderBy('priority', 'desc')->get());
    }

    public function active()
    {
        return response()->json(Donation::where('is_active', true)->orderBy('priority', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
            'logo_path' => 'nullable|string',
            'priority' => 'integer',
        ]);

        $donation = Donation::create($validated);
        return response()->json($donation, 201);
    }

    public function update(Request $request, Donation $donation)
    {
        $validated = $request->validate([
            'bank_name' => 'sometimes|string',
            'account_number' => 'sometimes|string',
            'account_name' => 'sometimes|string',
            'logo_path' => 'nullable|string',
            'priority' => 'integer',
            'is_active' => 'boolean',
        ]);

        $donation->update($validated);
        return response()->json($donation);
    }

    public function destroy(Donation $donation)
    {
        $donation->delete();
        return response()->json(['message' => 'Donation info deleted']);
    }

    public function toggle(Donation $donation)
    {
        $donation->update(['is_active' => !$donation->is_active]);
        return response()->json($donation);
    }
}
