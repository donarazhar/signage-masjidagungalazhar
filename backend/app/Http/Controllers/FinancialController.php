<?php

namespace App\Http\Controllers;

use App\Models\Financial;
use App\Http\Traits\ResolvesMosque;
use Illuminate\Http\Request;

class FinancialController extends Controller
{
    use ResolvesMosque;

    /**
     * List all financial records
     */
    public function index(Request $request)
    {
        $query = Financial::with('recorder:id,name')
            ->orderBy('record_date', 'desc');

        $mosqueId = $this->resolveMosqueId($request);
        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        }

        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('record_date', [$request->from, $request->to]);
        }

        return response()->json($query->get());
    }

    /**
     * Get financial summary for display
     */
    public function summary(Request $request)
    {
        $mosqueId = $this->resolveMosqueId($request);

        return response()->json([
            'saldo_kas' => Financial::getTotalBalance($mosqueId),
            'weekly_data' => Financial::getWeeklySummary($mosqueId),
            'last_updated' => Financial::where('mosque_id', $mosqueId)->latest('record_date')->first()?->record_date,
        ]);
    }

    /**
     * Store a new financial record
     */
    public function store(Request $request)
    {
        $request->validate([
            'record_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|in:infaq,zakat,sedekah,lainnya',
        ]);

        $financial = Financial::create([
            'record_date' => $request->record_date,
            'amount' => $request->amount,
            'description' => $request->description,
            'type' => $request->input('type', 'infaq'),
            'recorded_by' => $request->user()->id,
            'mosque_id' => $request->user()->mosque_id,
        ]);

        return response()->json([
            'message' => 'Data keuangan berhasil ditambahkan',
            'financial' => $financial->load('recorder:id,name'),
        ], 201);
    }

    /**
     * Update financial record
     */
    public function update(Request $request, Financial $financial)
    {
        $request->validate([
            'record_date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|in:infaq,zakat,sedekah,lainnya',
        ]);

        $financial->update($request->only([
            'record_date',
            'amount',
            'description',
            'type'
        ]));

        return response()->json([
            'message' => 'Data keuangan berhasil diperbarui',
            'financial' => $financial->fresh()->load('recorder:id,name'),
        ]);
    }

    /**
     * Delete financial record
     */
    public function destroy(Financial $financial)
    {
        $financial->delete();

        return response()->json([
            'message' => 'Data keuangan berhasil dihapus',
        ]);
    }
}
