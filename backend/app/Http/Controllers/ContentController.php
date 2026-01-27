<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Http\Traits\ResolvesMosque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContentController extends Controller
{
    use ResolvesMosque;

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
    public function active(Request $request)
    {
        $query = Content::active();

        $mosqueId = $this->resolveMosqueId($request);
        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        }

        return response()->json($query->get());
    }

    /**
     * Store a new content (upload image or add YouTube URL)
     */
    public function store(Request $request)
    {
        $contentType = $request->input('content_type', 'image'); // 'image' or 'youtube'

        if ($contentType === 'youtube') {
            // Validate YouTube URL
            $request->validate([
                'title' => 'required|string|max:255',
                'youtube_url' => 'required|url',
                'duration' => 'sometimes|integer|min:1',
                'priority' => 'sometimes|integer',
                'is_enabled' => 'sometimes|boolean',
                'start_date' => 'sometimes|nullable|date',
                'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            ]);

            // Extract YouTube video ID
            $youtubeUrl = $request->youtube_url;
            $videoId = $this->extractYoutubeId($youtubeUrl);

            if (!$videoId) {
                return response()->json(['message' => 'URL YouTube tidak valid'], 422);
            }

            $content = Content::create([
                'title' => $request->title,
                'type' => 'youtube',
                'file_path' => null,
                'youtube_url' => $youtubeUrl,
                'youtube_id' => $videoId,
                'duration' => $request->input('duration', 60),
                'priority' => $request->input('priority', 0),
                'is_enabled' => $request->input('is_enabled', true),
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'uploaded_by' => $request->user()->id,
                'mosque_id' => $request->user()->mosque_id,
            ]);
        } else {
            // Image upload
            $request->validate([
                'title' => 'required|string|max:255',
                'file' => 'required|file|mimes:jpg,jpeg,png,webp,gif|max:10240', // 10MB max for images
                'duration' => 'sometimes|integer|min:1',
                'priority' => 'sometimes|integer',
                'is_enabled' => 'sometimes|boolean',
                'start_date' => 'sometimes|nullable|date',
                'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            ]);

            $file = $request->file('file');
            $path = $file->store('contents', 'public');

            $content = Content::create([
                'title' => $request->title,
                'type' => 'image',
                'file_path' => $path,
                'youtube_url' => null,
                'youtube_id' => null,
                'duration' => $request->input('duration', 10),
                'priority' => $request->input('priority', 0),
                'is_enabled' => $request->input('is_enabled', true),
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'uploaded_by' => $request->user()->id,
                'mosque_id' => $request->user()->mosque_id,
            ]);
        }

        return response()->json([
            'message' => 'Konten berhasil ditambahkan',
            'content' => $content->load('uploader:id,name'),
        ], 201);
    }

    /**
     * Extract YouTube video ID from URL
     */
    private function extractYoutubeId($url)
    {
        $pattern = '/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/';
        preg_match($pattern, $url, $matches);
        return $matches[1] ?? null;
    }

    /**
     * Update content details
     */
    public function update(Request $request, Content $content)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'youtube_url' => 'sometimes|nullable|url',
            'duration' => 'sometimes|integer|min:1',
            'priority' => 'sometimes|integer',
            'is_enabled' => 'sometimes|boolean',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
        ]);

        $data = $request->only([
            'title',
            'duration',
            'priority',
            'is_enabled',
            'start_date',
            'end_date',
        ]);

        // If updating YouTube URL
        if ($request->has('youtube_url') && $content->type === 'youtube') {
            $videoId = $this->extractYoutubeId($request->youtube_url);
            if ($videoId) {
                $data['youtube_url'] = $request->youtube_url;
                $data['youtube_id'] = $videoId;
            }
        }

        $content->update($data);

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
        // Delete file from storage if it exists
        if ($content->file_path) {
            Storage::disk('public')->delete($content->file_path);
        }

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
