<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\ActivityLog;
use App\Http\Traits\ResolvesMosque;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use ResolvesMosque;

    /**
     * List all events
     */
    public function index()
    {
        $events = Event::with('creator:id,name')
            ->orderBy('event_date', 'asc')
            ->orderBy('event_time', 'asc')
            ->get();

        return response()->json($events);
    }

    /**
     * Get upcoming events for display (5 events)
     */
    public function upcoming(Request $request)
    {
        $query = Event::upcoming(5);

        $mosqueId = $this->resolveMosqueId($request);
        if ($mosqueId) {
            $query->where('mosque_id', $mosqueId);
        }

        return response()->json($query->get());
    }

    /**
     * Store a new event
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'event_date' => 'required|date',
            'event_time' => 'nullable|date_format:H:i',
            'description' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
            'is_enabled' => 'sometimes|boolean',
        ]);

        $event = Event::create([
            'title' => $request->title,
            'event_date' => $request->event_date,
            'event_time' => $request->event_time,
            'description' => $request->description,
            'location' => $request->location,
            'is_enabled' => $request->input('is_enabled', true),
            'created_by' => $request->user()->id,
            'mosque_id' => $request->user()->mosque_id,
        ]);

        // Log the activity
        ActivityLog::logCreate($event, "Menambahkan kegiatan: {$event->title}");

        return response()->json([
            'message' => 'Kegiatan berhasil ditambahkan',
            'event' => $event->load('creator:id,name'),
        ], 201);
    }

    /**
     * Update event
     */
    public function update(Request $request, Event $event)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'event_date' => 'sometimes|date',
            'event_time' => 'nullable|date_format:H:i',
            'description' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
            'is_enabled' => 'sometimes|boolean',
        ]);

        $oldValues = $event->toArray();
        $event->update($request->only([
            'title',
            'event_date',
            'event_time',
            'description',
            'location',
            'is_enabled',
        ]));

        // Log the activity
        ActivityLog::logUpdate($event, $oldValues, "Memperbarui kegiatan: {$event->title}");

        return response()->json([
            'message' => 'Kegiatan berhasil diperbarui',
            'event' => $event->fresh()->load('creator:id,name'),
        ]);
    }

    /**
     * Delete event
     */
    public function destroy(Event $event)
    {
        // Log before delete
        ActivityLog::logDelete($event, "Menghapus kegiatan: {$event->title}");

        $event->delete();

        return response()->json([
            'message' => 'Kegiatan berhasil dihapus',
        ]);
    }

    /**
     * Toggle event status
     */
    public function toggle(Event $event)
    {
        $oldStatus = $event->is_enabled;
        $event->update(['is_enabled' => !$event->is_enabled]);

        // Log the toggle action
        $action = $event->is_enabled ? 'mengaktifkan' : 'menonaktifkan';
        ActivityLog::log('update', "Mengubah status kegiatan ({$action})", Event::class, $event->id, ['is_enabled' => $oldStatus], ['is_enabled' => $event->is_enabled]);

        return response()->json([
            'message' => $event->is_enabled ? 'Kegiatan diaktifkan' : 'Kegiatan dinonaktifkan',
            'event' => $event,
        ]);
    }
}
