<?php

namespace App\Http\Controllers;

use App\Models\RunningText;
use App\Http\Traits\ResolvesMosque;
use Illuminate\Http\Request;

class RunningTextController extends Controller
{
    use ResolvesMosque;

    /**
     * List all running texts
     */
    public function index()
    {
        $texts = RunningText::with('creator:id,name')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($texts);
    }

    /**
     * Get active running texts for display
     */
    public function active(Request $request)
    {
        $query = RunningText::active();

        $mosqueId = $this->resolveMosqueId($request);
        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        }

        return response()->json($query->get());
    }

    /**
     * Store a new running text
     */
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:500',
            'type' => 'sometimes|in:normal,urgent,berita_duka',
            'priority' => 'sometimes|integer',
            'is_enabled' => 'sometimes|boolean',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'show_on_days' => 'sometimes|nullable|array',
            'show_on_days.*' => 'integer|min:0|max:6',
        ]);

        $text = RunningText::create([
            'content' => $request->content,
            'type' => $request->input('type', 'normal'),
            'priority' => $request->input('priority', 0),
            'is_enabled' => $request->input('is_enabled', true),
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'show_on_days' => $request->show_on_days,
            'created_by' => $request->user()->id,
            'mosque_id' => $request->user()->mosque_id,
        ]);

        return response()->json([
            'message' => 'Running text berhasil ditambahkan',
            'running_text' => $text->load('creator:id,name'),
        ], 201);
    }

    /**
     * Update running text
     */
    public function update(Request $request, RunningText $runningText)
    {
        $request->validate([
            'content' => 'sometimes|string|max:500',
            'type' => 'sometimes|in:normal,urgent,berita_duka',
            'priority' => 'sometimes|integer',
            'is_enabled' => 'sometimes|boolean',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'show_on_days' => 'sometimes|nullable|array',
            'show_on_days.*' => 'integer|min:0|max:6',
        ]);

        $runningText->update($request->only([
            'content',
            'type',
            'priority',
            'is_enabled',
            'start_date',
            'end_date',
            'show_on_days'
        ]));

        return response()->json([
            'message' => 'Running text berhasil diperbarui',
            'running_text' => $runningText->fresh()->load('creator:id,name'),
        ]);
    }

    /**
     * Delete running text
     */
    public function destroy(RunningText $runningText)
    {
        $runningText->delete();

        return response()->json([
            'message' => 'Running text berhasil dihapus',
        ]);
    }

    /**
     * Toggle running text enabled status
     */
    public function toggle(RunningText $runningText)
    {
        $runningText->update(['is_enabled' => !$runningText->is_enabled]);

        return response()->json([
            'message' => $runningText->is_enabled ? 'Running text diaktifkan' : 'Running text dinonaktifkan',
            'running_text' => $runningText,
        ]);
    }
}
