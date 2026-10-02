<?php

namespace NepseAlpha\LaganiVitz\Filament\Pages;

use Filament\Pages\Page;
use Filament\Panel;
use NepseAlpha\LaganiVitz\Filament\Widgets\LaganiStatsWidget;
use NepseAlpha\LaganiVitz\Support\FrontendShell;

class LaganiOverview extends Page
{
    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationLabel = 'Lagani Overview';

    protected static ?string $title = 'Lagani';

    protected string $view = 'lagani-vitz::filament.pages.lagani-overview';

    public static function getSlug(?Panel $panel = null): string
    {
        return config('lagani-vitz.admin.slug', 'lagani');
    }

    public static function getNavigationGroup(): ?string
    {
        return config('lagani-vitz.admin.navigation_group');
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
            'url' => url(config('lagani-vitz.frontend.path')),
            'built' => app(FrontendShell::class)->isBuilt(),
        ];
    }
}
