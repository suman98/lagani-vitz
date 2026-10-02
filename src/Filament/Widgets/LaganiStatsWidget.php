<?php

namespace NepseAlpha\LaganiVitz\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use NepseAlpha\LaganiVitz\Models\LaganiPlan;

class LaganiStatsWidget extends StatsOverviewWidget
{
    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $published = LaganiPlan::published()->count();
        $total = LaganiPlan::count();
        $avgReturn = LaganiPlan::published()->whereNotNull('expected_return_pct')->avg('expected_return_pct');

        return [
            Stat::make('Published plans', $published)
                ->description("{$total} total, ".($total - $published).' draft'),

            Stat::make('Avg. expected return', $avgReturn === null ? '—' : number_format((float) $avgReturn, 2).'%')
                ->description('Across published plans'),
        ];
    }
}
