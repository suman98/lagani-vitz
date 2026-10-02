<?php

namespace NepseAlpha\LaganiVitz\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use NepseAlpha\LaganiVitz\Models\LaganiPlan;

/**
 * @mixin LaganiPlan
 */
class PlanResource extends JsonResource
{
    private bool $withBody = false;

    /** Include the long-form `body`; the list endpoint leaves it out. */
    public function withBody(bool $withBody = true): static
    {
        $this->withBody = $withBody;

        return $this;
    }

    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'risk_level' => $this->risk_level,
            'min_amount' => $this->min_amount === null ? null : (float) $this->min_amount,
            'expected_return_pct' => $this->expected_return_pct === null ? null : (float) $this->expected_return_pct,
            'duration_months' => $this->duration_months,
            $this->mergeWhen($this->withBody, ['body' => $this->body]),
        ];
    }
}
