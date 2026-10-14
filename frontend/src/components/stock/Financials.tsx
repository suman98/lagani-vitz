'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBankingAnnual } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

// "NetInterest,FeeAndCommissionIncome" -> "Net Interest, Fee And Commission Income"
const humanize = (s: string) => s.replace(/([a-z).:,])(?=[A-Z(])/g, '$1 ').replace(/\s*&\s*/g, ' & ');

// Statement each banking_annual line item belongs to, by its upper `order` bound.
const SECTIONS = [
  { last: 39, id: 'balance-sheet', title: 'Balance Sheet', short: 'Balance Sheet' },
  { last: 64, id: 'income-statement', title: 'Income Statement', short: 'Income Statement' },
  { last: 79, id: 'comprehensive-income', title: 'Statement of Comprehensive Income', short: 'Comprehensive Income' },
  { last: 128, id: 'cash-flows', title: 'Statement of Cash Flows', short: 'Cash Flows' },
  { last: 151, id: 'distributable-profit', title: 'Statement of Distributable Profit or Loss', short: 'Distributable Profit' },
  { last: Infinity, id: 'miscellaneous', title: 'Miscellaneous', short: 'Miscellaneous' },
];

// Headings land at 128px (scroll-mt-32), just under the sticky navbar + statement menu.
const ACTIVE_LINE = 140;

const sectionOf = (order: number | null) => SECTIONS.find((s) => (order ?? Infinity) <= s.last)!;

const formatValue = (v: string | null) =>
  !v || Number(v) === 0
    ? '-'
    : /^-?\d+(\.\d+)?$/.test(v)
      ? Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })
      : v;

export function Financials() {
  const router = useRouter();
  const pathname = usePathname();
  const symbol = useSearchParams().get('symbol');
  const { state, retry } = useAsync((signal) => getBankingAnnual(symbol, signal), [symbol]);

  // Rows arrive after the browser's own #hash scroll, so a deep link needs a second jump.
  const ready = state.status === 'ready';
  useEffect(() => {
    if (ready && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [ready]);

  // Active statement = last heading scrolled past the menu; at page bottom, the last one
  // (short trailing sections never reach the line).
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    const headings = SECTIONS.map((s) => document.getElementById(s.id)).filter((el) => el !== null);
    const update = () => {
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      const passed = headings.filter((el) => el.getBoundingClientRect().top <= ACTIVE_LINE);
      setActive((atBottom ? headings.at(-1) : (passed.at(-1) ?? headings[0]))?.id ?? null);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    return () => removeEventListener('scroll', update);
  }, [ready, state]);

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
  const sections = SECTIONS.filter((s) => rows.some((r) => sectionOf(r.order) === s));

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
        <>
          <nav aria-label="Statements" className="sticky top-16 z-10 -mx-1 mb-4 bg-white px-1 py-2">
            <ul className="flex gap-2 overflow-x-auto [scrollbar-width:thin]">
              {sections.map((s) => (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? 'location' : undefined}
                    className={`focus-ring block rounded-md border px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-200 ${
                      active === s.id
                        ? 'border-forest bg-forest font-medium text-white'
                        : 'border-line text-ink/80 hover:border-forest hover:text-forest'
                    }`}
                  >
                    {s.short}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
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
                    <tr key={`section-${i}`} className="border-t border-forest/30 bg-forest/10">
                      <th
                        id={sectionOf(row.order).id}
                        scope="colgroup"
                        colSpan={years.length + 1}
                        className="scroll-mt-32 px-4 py-3 text-left text-[15px] font-semibold tracking-tight text-forest-dark shadow-[inset_4px_0_0_var(--color-forest)]"
                      >
                        {sectionOf(row.order).title}
                      </th>
                    </tr>
                  ),
                  <tr key={i} className="border-t border-line">
                    <th
                      scope="row"
                      className="sticky left-0 min-w-44 bg-white sm:min-w-64 px-4 py-2.5 text-left font-normal text-ink"
                    >
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
        </>
      )}
    </section>
  );
}
