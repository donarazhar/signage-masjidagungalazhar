<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hadith;
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
            $query->where('mosque_id', $mosqueId);
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
