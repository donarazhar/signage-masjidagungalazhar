<?php

namespace App\Http\Traits;

use App\Models\Mosque;

trait ResolvesMosque
{
    /**
     * Resolve mosque ID from slug or ID parameter
     */
    protected function resolveMosqueId($request)
    {
        // Support both mosque_id and m parameter (slug)
        $mosqueParam = $request->query('mosque_id') ?? $request->query('m');

        if (empty($mosqueParam)) {
            return null;
        }

        // If numeric, return as-is
        if (is_numeric($mosqueParam)) {
            return (int) $mosqueParam;
        }

        // Otherwise lookup by slug
        $mosque = Mosque::where('slug', $mosqueParam)->first();
        return $mosque?->id;
    }
}
