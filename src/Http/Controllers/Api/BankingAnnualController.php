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

        // Spreadsheet sub-items (110.1, 110.2) were rounded into the integer `order`
        // column, so a line item is identified by order + particulars, not order alone.
        $rows = $records
            ->groupBy(fn ($r) => $r->order.'|'.$r->particulars)
            ->map(fn ($items) => [
                'order' => $items->first()->order,
                'particulars' => $items->first()->particulars,
                'values' => (object) $items->pluck('value', 'fiscal_year')->map($this->clean(...))->all(),
            ])
            ->values();

        return response()->json(['data' => [
            'symbols' => $symbols,
            'symbol' => $symbol,
            'fiscal_years' => $records->pluck('fiscal_year')->unique()->sortDesc()->values(),
            'rows' => $rows,
        ]])->header('Cache-Control', 'public, max-age=60');
    }

    /** The import stored Excel's accounting display format, e.g. "_(* -1315335_)". */
    private function clean(?string $value): ?string
    {
        return $value === null ? null : preg_replace('/^_\(\*\s*(.*?)\s*_\)$/', '$1', trim($value));
    }
}
