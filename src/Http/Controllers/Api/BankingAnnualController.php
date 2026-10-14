<?php

namespace NepseAlpha\LaganiViz\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use NepseAlpha\LaganiViz\Support\OwnDatabase;

/**
 * Annual financial statement of one symbol, pivoted: one row per line item,
 * one value per fiscal year (latest first).
 */
class BankingAnnualController
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = fn () => DB::connection(OwnDatabase::connection())
            ->table(config('lagani-viz.database.own.tables.banking_annual', 'banking_annual'));

        $symbols = $query()->whereNotNull('symbol')->distinct()->orderBy('symbol')->pluck('symbol');
        $symbol = $request->string('symbol')->upper()->value() ?: $symbols->first();

        $records = $query()
            ->where('symbol', $symbol)
            ->orderBy('order')
            ->orderBy('id')
            ->get(['order', 'particulars', 'fiscal_year', 'value']);

        // Particulars repeat across statements (e.g. DueFromNepalRastraBank in balance
        // sheet and cash flows), so a line item is order + particulars.
        $rows = $records
            ->groupBy(fn ($r) => $r->order.'|'.$r->particulars)
            ->map(fn ($items) => [
                // pgsql NUMERIC arrives as a string ("110.10").
                'order' => $items->first()->order === null ? null : (float) $items->first()->order,
                'particulars' => $items->first()->particulars,
                'values' => (object) $items->pluck('value', 'fiscal_year')->map($this->clean(...))->all(),
            ])
            ->values();

        return response()->json(['data' => [
            'symbols' => $symbols,
            'symbol' => $symbol,
            'fiscal_years' => $records->pluck('fiscal_year')->unique()->sortDesc()->values(),
            'rows' => $rows,
            'npr_per_usd' => ((float) config('lagani-viz.currency.npr_per_usd')) ?: null,
        ]])->header('Cache-Control', 'public, max-age=60');
    }

    /** The import stored Excel's accounting display format, e.g. "_(* -1315335_)". */
    private function clean(?string $value): ?string
    {
        return $value === null ? null : preg_replace('/^_\(\*\s*(.*?)\s*_\)$/', '$1', trim($value));
    }
}
