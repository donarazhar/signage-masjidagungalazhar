<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Hadith;

class HadithController extends Controller
{
    public function index()
    {
        return Hadith::orderBy('created_at', 'desc')->get();
    }

    public function active()
    {
        // Get one active hadith randomly or latest? 
        // Let's get "latest active" for now, or random.
        // User said "manage", implied one might be shown. 
        // Let's pick random active one to make it dynamic if multiple are active.
        $hadith = Hadith::where('is_active', true)->inRandomOrder()->first();
        return response()->json($hadith);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'source' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $hadith = Hadith::create($validated);
        return response()->json($hadith, 201);
    }

    public function update(Request $request, Hadith $hadith)
    {
        $validated = $request->validate([
            'content' => 'string',
            'source' => 'string',
            'is_active' => 'boolean'
        ]);

        $hadith->update($validated);
        return response()->json($hadith);
    }

    public function destroy(Hadith $hadith)
    {
        $hadith->delete();
        return response()->json(null, 204);
    }

    public function toggle(Hadith $hadith)
    {
        $hadith->update(['is_active' => !$hadith->is_active]);
        return response()->json($hadith);
    }
}
