<?php

namespace NepseAlpha\LaganiVitz;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use NepseAlpha\LaganiVitz\Console\MigrateCommand;
use NepseAlpha\LaganiVitz\Support\FrontendShell;

/**
 * Always-on part of the package: config, migrations, views, the public
 * `/{frontend.path}` frontend and its JSON API.
 *
 * The Filament side lives in {@see Filament\LaganiVitzPlugin} and is attached
 * by the host panel provider, so nothing here touches Filament at boot.
 */
class LaganiVitzServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/lagani-vitz.php', 'lagani-vitz');

        $this->registerDatabaseConnections();

        $this->app->singleton(FrontendShell::class, fn () => new FrontendShell(
            config('lagani-vitz.frontend.dist_path') ?: dirname(__DIR__).'/dist',
        ));
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'lagani-vitz');

        $this->registerRoutes();

        if ($this->app->runningInConsole()) {
            // Package migrations are NOT loaded into the host's `migrate`: they run on the
            // package database through this command (see Console\MigrateCommand).
            $this->commands([MigrateCommand::class]);

            $this->publishes([
                __DIR__.'/../config/lagani-vitz.php' => config_path('lagani-vitz.php'),
            ], 'lagani-vitz-config');

            // Hashed JS/CSS chunks of the Next.js export. nginx/Valet serve these
            // straight from public/, so PHP never streams static files.
            $this->publishes([
                dirname(__DIR__).'/dist/_next' => public_path('vendor/lagani-vitz/_next'),
            ], 'lagani-vitz-assets');
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
        foreach (['own' => 'lagani_vitz', 'main' => 'lagani_vitz_main'] as $side => $defaultName) {
            $name = config("lagani-vitz.database.{$side}.connection") ?: $defaultName;

            if (config("database.connections.{$name}") === null) {
                $definition = array_filter(
                    config("lagani-vitz.database.{$side}.config", []),
                    fn ($value) => $value !== null,
                );

                if (filled($definition['url'] ?? null) || filled($definition['database'] ?? null)) {
                    config(["database.connections.{$name}" => $definition]);
                } elseif ($side === 'main') {
                    continue; // quietly shares the host's default connection
                }
                // `own` keeps its name even when undefined: OwnDatabase refuses to guess.
            }

            config(["lagani-vitz.database.{$side}.connection" => $name]);
        }
    }

    private function registerRoutes(): void
    {
        if (! config('lagani-vitz.frontend.enabled') || $this->app->routesAreCached()) {
            return;
        }

        $path = trim(config('lagani-vitz.frontend.path'), '/');

        // API first: the frontend route below is a catch-all under the same prefix.
        Route::middleware(config('lagani-vitz.api.middleware', []))
            ->prefix($path.'/'.trim(config('lagani-vitz.api.prefix'), '/'))
            ->name('lagani-vitz.api.')
            ->group(__DIR__.'/../routes/api.php');

        Route::middleware(config('lagani-vitz.frontend.middleware', []))
            ->prefix($path)
            ->name('lagani-vitz.')
            ->group(__DIR__.'/../routes/web.php');
    }
}
