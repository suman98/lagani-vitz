<?php

namespace NepseAlpha\LaganiViz\Filament\Pages;

use Filament\Pages\Page;
use Filament\Panel;
use NepseAlpha\LaganiViz\Filament\Widgets\LaganiStatsWidget;
use NepseAlpha\LaganiViz\Support\FrontendShell;

class LaganiOverview extends Page
{
    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationLabel = 'Lagani Overview';

    protected static ?string $title = 'Lagani';

    protected string $view = 'lagani-viz::filament.pages.lagani-overview';

    public static function getSlug(?Panel $panel = null): string
    {
        return config('lagani-viz.admin.slug', 'lagani');
    }

    public static function getNavigationGroup(): ?string
    {
        return config('lagani-viz.admin.navigation_group');
    }

    protected function getHeaderWidgets(): array
    {
        return [
            LaganiStatsWidget::class,
        ];
    }

    /**
     * @return array{url: string, built: bool}
     */
    public function getFrontendInfo(): array
    {
        return [
            'url' => url(config('lagani-viz.frontend.path')),
            'built' => app(FrontendShell::class)->isBuilt(),
        ];
    }
}
