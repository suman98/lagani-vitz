<?php

namespace NepseAlpha\LaganiVitz\Support;

use RuntimeException;

/**
 * The package's own database. Unlike `main`, it never falls back to the host's
 * default connection: tables must not land in the main application's database
 * just because an env var is missing.
 */
final class OwnDatabase
{
    /**
     * Name of the connection holding the package's tables.
     *
     * @throws RuntimeException when no database has been configured for it
     */
    public static function connection(): string
    {
        $name = config('lagani-vitz.database.own.connection') ?: 'lagani_vitz';
        $definition = config("database.connections.{$name}");

        if (blank($definition['database'] ?? null) && blank($definition['url'] ?? null)) {
            throw new RuntimeException(
                "The LaganiVitz database is not configured (connection [{$name}]). "
                .'Set LAGANI_VITZ_DB_HOST, LAGANI_VITZ_DB_DATABASE, LAGANI_VITZ_DB_USERNAME and '
                .'LAGANI_VITZ_DB_PASSWORD, then run `php artisan lagani-vitz:migrate`.'
            );
        }

        return $name;
    }

    public static function migrationsPath(): string
    {
        return dirname(__DIR__, 2).'/database/migrations';
    }
}
