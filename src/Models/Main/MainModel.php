<?php

namespace NepseAlpha\LaganiViz\Models\Main;

use Illuminate\Database\Eloquent\Model;
use LogicException;
use NepseAlpha\LaganiViz\Support\MainDatabase;

/**
 * Base for read-only models over the host application's database.
 *
 * They run on the `main` connection and take their table name from
 * `database.main.tables`, so deployment decides both. Instance writes throw;
 * set-based writes (`::query()->update()`) are not intercepted, so the
 * `main` connection's database user should only hold SELECT grants.
 */
abstract class MainModel extends Model
{
    /** Logical name of the table in `database.main.tables`. */
    abstract protected function logicalTable(): string;

    public function getConnectionName(): ?string
    {
        return config('lagani-viz.database.main.connection') ?: parent::getConnectionName();
    }

    public function getTable(): string
    {
        return MainDatabase::tableName($this->logicalTable());
    }

    public function save(array $options = []): never
    {
        throw new LogicException(static::class.' is read-only.');
    }

    public function delete(): never
    {
        throw new LogicException(static::class.' is read-only.');
    }
}
