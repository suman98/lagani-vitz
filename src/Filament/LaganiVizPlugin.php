<?php

namespace NepseAlpha\LaganiVitz\Filament;

use Filament\Contracts\Plugin;
use Filament\Navigation\NavigationItem;
use Filament\Panel;
use NepseAlpha\LaganiVitz\Filament\Pages\LaganiOverview;
use NepseAlpha\LaganiVitz\Filament\Resources\LaganiPlans\LaganiPlanResource;
use NepseAlpha\LaganiVitz\Filament\Resources\ShareOwnerships\ShareOwnershipResource;
use NepseAlpha\LaganiVitz\Filament\Widgets\LaganiStatsWidget;

/**
 * Attach to a panel provider:
 *
 *     $panel->plugin(LaganiVitzPlugin::make())
 *
 * Pages and resources are mounted under `{panel path}/{admin.slug}`
 * (e.g. `/admin/v2/lagani`).
 */
class LaganiVitzPlugin implements Plugin
{
    public static function make(): static
    {
        return app(static::class);
    }

    public static function get(): static
    {
        /** @var static $plugin */
        $plugin = filament(app(static::class)->getId());

        return $plugin;
    }

    public function getId(): string
    {
        return 'lagani-vitz';
    }

    public function register(Panel $panel): void
    {
        $panel
            ->pages([
                LaganiOverview::class,
            ])
            ->resources([
                LaganiPlanResource::class,
                ShareOwnershipResource::class,
            ])
            // Registered with Livewire only: the widget belongs to LaganiOverview and
            // must not leak onto the host panel's Dashboard (as ->widgets() would).
            ->livewireComponents([
                LaganiStatsWidget::class,
            ]);
    }

    public function boot(Panel $panel): void
    {
        //
    }

    /**
     * For hosts that build their sidebar by hand with `->navigation(...)`:
     * Filament then ignores the pages'/resources' own navigation registration,
     * so the host adds these items itself.
     *
     * @return list<NavigationItem>
     */
    public static function navigationItems(): array
    {
        return [
            NavigationItem::make('Lagani Overview')
                ->icon('heroicon-o-banknotes')
                ->isActiveWhen(fn (): bool => request()->routeIs(LaganiOverview::getRouteName()))
                ->url(fn (): string => LaganiOverview::getUrl()),

            NavigationItem::make('Lagani Plans')
                ->icon('heroicon-o-rectangle-stack')
                ->isActiveWhen(fn (): bool => request()->routeIs(LaganiPlanResource::getRouteBaseName().'.*'))
                ->url(fn (): string => LaganiPlanResource::getUrl()),

            NavigationItem::make('Share Ownership')
                ->icon('heroicon-o-chart-pie')
                ->isActiveWhen(fn (): bool => request()->routeIs(ShareOwnershipResource::getRouteBaseName().'.*'))
                ->url(fn (): string => ShareOwnershipResource::getUrl()),
        ];
    }
}
