<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContentController extends Controller
{
    /**
     * List all contents
     */
    public function index()
    {
        $contents = Content::with('uploader:id,name')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($contents);
    }

    /**
     * Get active contents for display
     */
    public function active()
    {
        $contents = Content::active()->get();

        return response()->json($contents);
    }

    /**
     * Store a new content (upload)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,mp4,webm|max:51200', // 50MB max
            'duration' => 'sometimes|integer|min:1',
            'priority' => 'sometimes|integer',
            'is_enabled' => 'sometimes|boolean',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'show_on_days' => 'sometimes|nullable|array',
            'show_on_days.*' => 'integer|min:0|max:6',
        ]);

        $file = $request->file('file');
        $type = in_array($file->getClientOriginalExtension(), ['mp4', 'webm']) ? 'video' : 'image';

        $path = $file->store('contents', 'public');

        $content = Content::create([
            'title' => $request->title,
            'type' => $type,
            'file_path' => $path,
            'duration' => $request->input('duration', $type === 'video' ? 0 : 10),
            'priority' => $request->input('priority', 0),
            'is_enabled' => $request->input('is_enabled', true),
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'show_on_days' => $request->show_on_days,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Konten berhasil diupload',
            'content' => $content->load('uploader:id,name'),
        ], 201);
    }

    /**
     * Update content details
     */
    public function update(Request $request, Content $content)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'duration' => 'sometimes|integer|min:1',
            'priority' => 'sometimes|integer',
            'is_enabled' => 'sometimes|boolean',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'show_on_days' => 'sometimes|nullable|array',
            'show_on_days.*' => 'integer|min:0|max:6',
        ]);

        $content->update($request->only([
            'title',
            'duration',
            'priority',
            'is_enabled',
            'start_date',
            'end_date',
            'show_on_days'
        ]));

        return response()->json([
            'message' => 'Konten berhasil diperbarui',
            'content' => $content->fresh()->load('uploader:id,name'),
        ]);
    }

    /**
     * Delete content
     */
    public function destroy(Content $content)
    {
        // Delete file from storage
        Storage::disk('public')->delete($content->file_path);

        $content->delete();

        return response()->json([
            'message' => 'Konten berhasil dihapus',
        ]);
    }

    /**
     * Toggle content enabled status
     */
    public function toggle(Content $content)
    {
        $content->update(['is_enabled' => !$content->is_enabled]);

        return response()->json([
            'message' => $content->is_enabled ? 'Konten diaktifkan' : 'Konten dinonaktifkan',
            'content' => $content,
        ]);
    }

    /**
     * Reorder contents
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:contents,id',
            'orders.*.priority' => 'required|integer',
        ]);

        foreach ($request->orders as $order) {
            Content::where('id', $order['id'])->update(['priority' => $order['priority']]);
        }

        return response()->json([
            'message' => 'Urutan konten berhasil diperbarui',
        ]);
    }
}
