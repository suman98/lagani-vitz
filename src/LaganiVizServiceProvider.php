<?php

namespace NepseAlpha\LaganiViz;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use NepseAlpha\LaganiViz\Console\MigrateCommand;
use NepseAlpha\LaganiViz\Support\FrontendShell;

/**
 * Always-on part of the package: config, migrations, views, the public
 * `/{frontend.path}` frontend and its JSON API.
 *
 * The Filament side lives in {@see Filament\LaganiVizPlugin} and is attached
 * by the host panel provider, so nothing here touches Filament at boot.
 */
class LaganiVizServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/lagani-viz.php', 'lagani-viz');

        $this->registerDatabaseConnections();

        $this->app->singleton(FrontendShell::class, fn () => new FrontendShell(
            config('lagani-viz.frontend.dist_path') ?: dirname(__DIR__).'/dist',
        ));
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'lagani-viz');

        $this->registerRoutes();

        if ($this->app->runningInConsole()) {
            // Package migrations are NOT loaded into the host's `migrate`: they run on the
            // package database through this command (see Console\MigrateCommand).
            $this->commands([MigrateCommand::class]);

            $this->publishes([
                __DIR__.'/../config/lagani-viz.php' => config_path('lagani-viz.php'),
            ], 'lagani-viz-config');

            // Hashed JS/CSS chunks of the Next.js export. nginx/Valet serve these
            // straight from public/, so PHP never streams static files.
            $this->publishes([
                dirname(__DIR__).'/dist/_next' => public_path('vendor/lagani-viz/_next'),
            ], 'lagani-viz-assets');
        }
    }

    /**
     * Settles which connection `own` and `main` use (see config for the rules).
     * Afterwards `database.{own,main}.connection` holds the connection name; for
     * `main` it stays null (the host's default connection) when nothing is set.
     *
     * A connection the host already defines under that name always wins: the
     * package only registers one from its own env when the name is still free.
     */
    private function registerDatabaseConnections(): void
    {
        foreach (['own' => 'lagani_viz', 'main' => 'lagani_viz_main'] as $side => $defaultName) {
            $name = config("lagani-viz.database.{$side}.connection") ?: $defaultName;

            if (config("database.connections.{$name}") === null) {
                $definition = array_filter(
                    config("lagani-viz.database.{$side}.config", []),
                    fn ($value) => $value !== null,
                );

                if (filled($definition['url'] ?? null) || filled($definition['database'] ?? null)) {
                    config(["database.connections.{$name}" => $definition]);
                } elseif ($side === 'main') {
                    continue; // quietly shares the host's default connection
                }
                // `own` keeps its name even when undefined: OwnDatabase refuses to guess.
            }

            config(["lagani-viz.database.{$side}.connection" => $name]);
        }
    }

    private function registerRoutes(): void
    {
        if (! config('lagani-viz.frontend.enabled') || $this->app->routesAreCached()) {
            return;
        }

        $path = trim(config('lagani-viz.frontend.path'), '/');

        // API first: the frontend route below is a catch-all under the same prefix.
        Route::middleware(config('lagani-viz.api.middleware', []))
            ->prefix($path.'/'.trim(config('lagani-viz.api.prefix'), '/'))
            ->name('lagani-viz.api.')
            ->group(__DIR__.'/../routes/api.php');

        Route::middleware(config('lagani-viz.frontend.middleware', []))
            ->prefix($path)
            ->name('lagani-viz.')
            ->group(__DIR__.'/../routes/web.php');
    }
}
