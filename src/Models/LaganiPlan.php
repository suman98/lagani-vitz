<?php

namespace NepseAlpha\LaganiVitz\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use NepseAlpha\LaganiVitz\Support\OwnDatabase;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $summary
 * @property string|null $body
 * @property string $risk_level
 * @property string|null $min_amount
 * @property string|null $expected_return_pct
 * @property int|null $duration_months
 * @property bool $is_published
 * @property int $sort_order
 */
class LaganiPlan extends Model
{
    public const RISK_LEVELS = [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
    ];

    protected $guarded = [];

    protected $casts = [
        'is_published' => 'boolean',
        'min_amount' => 'decimal:2',
        'expected_return_pct' => 'decimal:2',
        'duration_months' => 'integer',
        'sort_order' => 'integer',
    ];

    public function getTable(): string
    {
        return config('lagani-vitz.database.own.tables.plans', 'lagani_plans');
    }

    public function getConnectionName(): ?string
    {
        return OwnDatabase::connection();
    }

    protected static function booted(): void
    {
        static::saving(function (self $plan) {
            if (blank($plan->slug)) {
                $plan->slug = Str::slug($plan->title);
            }
        });
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}
