'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getBankingAnnual } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

// "NetInterest,FeeAndCommissionIncome" -> "Net Interest, Fee And Commission Income"
const humanize = (s: string) => s.replace(/([a-z).:,])(?=[A-Z(])/g, '$1 ').replace(/\s*&\s*/g, ' & ');

// Statement each banking_annual line item belongs to, by its upper `order` bound.
const SECTIONS = [
  { last: 39, title: 'Balance Sheet' },
  { last: 64, title: 'Income Statement' },
  { last: 79, title: 'Statement of Comprehensive Income' },
  { last: 128, title: 'Statement of Cash Flows' },
  { last: 151, title: 'Statement of Distributable Profit or Loss' },
  { last: Infinity, title: 'Miscellaneous' },
];

const sectionOf = (order: number | null) => SECTIONS.find((s) => (order ?? Infinity) <= s.last)!.title;

const formatValue =(v: string | null) =>
  v && /^-?\d+(\.\d+)?$/.test(v) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) : (v ?? '');

export function Financials() {
  const router = useRouter();
  const pathname = usePathname();
  const symbol = useSearchParams().get('symbol');
  const { state, retry } = useAsync((signal) => getBankingAnnual(symbol, signal), [symbol]);

  if (state.status === 'loading') return <p className="muted">Loading…</p>;

  if (state.status === 'error') {
    return (
      <div className="state" role="alert">
        <p>Could not load financials. {state.error.message}.</p>
        <button className="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  const { symbols, fiscal_years: years, rows } = state.data;

  return (
    <section aria-labelledby="financials-title">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 id="financials-title" className="text-2xl font-semibold tracking-tight text-ink">
          Financials
        </h1>
        <label className="flex items-center gap-2 text-sm text-muted">
          Symbol
          <select
            value={state.data.symbol ?? ''}
            onChange={(e) => router.replace(`${pathname}?symbol=${encodeURIComponent(e.target.value)}`)}
            className="focus-ring h-9 rounded-md border border-line bg-white px-3 text-ink"
          >
            {symbols.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="muted">No financial data for this symbol.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="sticky left-0 bg-surface px-4 py-3 text-left font-medium text-muted">
                  Particulars
                </th>
                {years.map((fy) => (
                  <th key={fy} scope="col" className="px-4 py-3 text-right font-medium whitespace-nowrap text-ink">
                    {fy}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.flatMap((row, i) => [
                sectionOf(row.order) !== (i > 0 ? sectionOf(rows[i - 1].order) : null) && (
                  <tr key={`section-${i}`} className="border-t border-line bg-surface">
                    <th
                      scope="colgroup"
                      colSpan={years.length + 1}
                      className="sticky left-0 px-4 pt-5 pb-2 text-left text-xs font-semibold tracking-wide text-forest uppercase"
                    >
                      {sectionOf(row.order)}
                    </th>
                  </tr>
                ),
                <tr key={i} className="border-t border-line">
                  <th scope="row" className="sticky left-0 min-w-44 bg-white sm:min-w-64 px-4 py-2.5 text-left font-normal text-ink">
                    {humanize(row.particulars)}
                  </th>
                  {years.map((fy) => (
                    <td key={fy} className="px-4 py-2.5 text-right whitespace-nowrap tabular-nums text-ink">
                      {formatValue(row.values[fy])}
                    </td>
                  ))}
                </tr>,
              ])}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
