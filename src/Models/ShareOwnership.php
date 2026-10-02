<?php

namespace NepseAlpha\LaganiVitz\Models;

use Illuminate\Database\Eloquent\Model;
use NepseAlpha\LaganiVitz\Support\OwnDatabase;

/**
 * @property int $id
 * @property string $symbol
 * @property string $fy
 * @property string $shareholder_type
 * @property string $percent_holding
 * @property bool $is_total
 */
class ShareOwnership extends Model
{
    protected $guarded = [];

    protected $casts = [
        'percent_holding' => 'decimal:2',
        'is_total' => 'boolean',
    ];

    public function getTable(): string
    {
        return config('lagani-vitz.database.own.tables.share_ownerships', 'share_ownerships');
    }

    public function getConnectionName(): ?string
    {
        return OwnDatabase::connection();
    }
}
