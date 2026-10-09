<?php

namespace NepseAlpha\LaganiViz\Models\Main;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

/**
 * Read-only view of the main app's live/EOD price rows
 * (`App\Models\Prices\LivePrice`, table `web_today_price`).
 *
 * Table: `database.main.tables.live_prices`
 * (env LAGANI_VIZ_MAIN_TABLE_LIVE_PRICES, default `web_today_price`).
 *
 * Only the columns and scopes the package needs are mirrored. The host
 * model's relations (master data, score board, ...) point at host models and
 * are left out; add package-side models for them when the data is needed.
 *
 * @property int $id
 * @property string $symbol
 * @property string|null $today_price
 * @property string|null $change_rate
 * @property float|null $open
 * @property float|null $high
 * @property float|null $low
 * @property float|null $close
 * @property float|null $volume
 * @property float|null $actual_volume
 * @property float|null $percent_change
 * @property float|null $turn_over
 * @property bool|null $from_history
 * @property string|null $ltv
 * @property string|null $previous_close
 * @property Carbon|null $created_at
 */
class LivePrice extends MainModel
{
    protected $casts = [
        'open' => 'double',
        'high' => 'double',
        'close' => 'double',
        'low' => 'double',
        'volume' => 'double',
        'actual_volume' => 'double',
        'percent_change' => 'double',
        'turn_over' => 'double',
        'from_history' => 'boolean',
    ];

    protected function logicalTable(): string
    {
        return 'live_prices';
    }

    public function scopeForSymbol(Builder $query, string $symbol): Builder
    {
        return $query->where($this->qualifyColumn('symbol'), strtoupper($symbol));
    }

    /** End-of-day rows only (the host flags them `from_history`). */
    public function scopeEod(Builder $query): Builder
    {
        return $query->where($this->qualifyColumn('from_history'), true);
    }

    /**
     * Newest row per symbol (highest id), i.e. the current price of each stock.
     * The host's `latestLive` also checks market hours via a host helper; the
     * package has no access to that, so callers combine this with `eod()`
     * themselves when the market is closed.
     */
    public function scopeLatestPerSymbol(Builder $query): Builder
    {
        $latest = $this->newModelQuery()
            ->select('symbol as live_symbol')
            ->selectRaw('max(id) as max_id')
            ->groupBy('symbol');

        if (empty($query->getQuery()->columns)) {
            $query->select($this->qualifyColumn('*'));
        }

        return $query->joinSub($latest, 'latest', fn ($join) => $join
            ->on($this->qualifyColumn('symbol'), '=', 'latest.live_symbol')
            ->on($this->qualifyColumn('id'), '=', 'latest.max_id'));
    }
}
