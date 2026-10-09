<?php

namespace NepseAlpha\LaganiViz\Console;

use Illuminate\Console\Command;
use NepseAlpha\LaganiViz\Support\OwnDatabase;

/**
 * Runs the package migrations against the package's own database, so both the
 * tables and the `migrations` bookkeeping table live there and nothing is
 * written to the host's default connection. The host's plain `php artisan
 * migrate` does not see these migrations.
 */
class MigrateCommand extends Command
{
    protected $signature = 'lagani-viz:migrate
        {--rollback : Roll back the last package migration batch}
        {--status : Show the status of the package migrations}
        {--pretend : Print the SQL instead of running it}
        {--force : Run in production without confirmation}';

    protected $description = 'Run the LaganiViz migrations on the package database (LAGANI_VIZ_DB_*)';

    public function handle(): int
    {
        $options = [
            '--database' => OwnDatabase::connection(),
            '--path' => OwnDatabase::migrationsPath(),
            '--realpath' => true,
        ];

        if ($this->option('status')) {
            return $this->call('migrate:status', $options);
        }

        $options['--force'] = (bool) $this->option('force');

        if ($this->option('rollback')) {
            return $this->call('migrate:rollback', $options);
        }

        $options['--pretend'] = (bool) $this->option('pretend');

        return $this->call('migrate', $options);
    }
}
