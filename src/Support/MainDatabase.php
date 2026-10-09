<?php

namespace NepseAlpha\LaganiViz\Support;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Read access to the host application's database (`database.main` config).
 *
 *     MainDatabase::table('stocks')->where('symbol', 'NABIL')->first();
 *
 * Tables are addressed by logical name; the real table names come from
 * `lagani-viz.database.main.tables`, so each deployment decides them.
 * The package never writes through this class; give the `main` connection a
 * read-only database user to enforce it.
 */
final class MainDatabase
{
    public static function connection(): ConnectionInterface
    {
        return DB::connection(config('lagani-viz.database.main.connection'));
    }

    public static function table(string $logicalName): Builder
    {
        return self::connection()->table(self::tableName($logicalName));
    }

    public static function tableName(string $logicalName): string
    {
        $table = config("lagani-viz.database.main.tables.{$logicalName}");

        if (blank($table)) {
            throw new InvalidArgumentException(
                "No main-database table configured for [{$logicalName}]. "
                .'Add it to `database.main.tables` in config/lagani-viz.php.'
            );
        }

        return $table;
    }
}
