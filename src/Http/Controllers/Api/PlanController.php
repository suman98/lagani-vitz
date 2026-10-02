<?php

namespace NepseAlpha\LaganiVitz\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use NepseAlpha\LaganiVitz\Http\Resources\PlanResource;
use NepseAlpha\LaganiVitz\Models\LaganiPlan;

/**
 * The `{"data": ...}` envelope is built by hand: hosts may call
 * `JsonResource::withoutWrapping()` globally, which would silently strip it
 * and break the frontend.
 */
class PlanController
{
    /** Published content changes rarely; let browsers/CDN reuse it briefly. */
    private const CACHE_CONTROL = 'public, max-age=60';

    public function index(): JsonResponse
    {
        $plans = LaganiPlan::published()->ordered()->limit(100)->get();

        return $this->respond(PlanResource::collection($plans)->resolve());
    }

    public function show(string $slug): JsonResponse
    {
        $plan = LaganiPlan::published()->where('slug', $slug)->firstOrFail();

        return $this->respond((new PlanResource($plan))->withBody()->resolve());
    }

    private function respond(array $data): JsonResponse
    {
        return response()->json(['data' => $data])->header('Cache-Control', self::CACHE_CONTROL);
    }
}
