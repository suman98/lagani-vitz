'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type FinancialStatement, getBankingAnnual } from '@/lib/api';
import {
  commonSize,
  type GrowthYears,
  growthAmount,
  growthPct,
  heat,
  heatColor,
  perShare,
  shiftFiscalYear,
  toNumber,
  type View,
} from '@/lib/financialViews';
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

const VIEWS: { value: View; label: string }[] = [
  { value: 'values', label: 'Values' },
  { value: 'growth-amt', label: 'Growth Amt' },
  { value: 'growth-pct', label: 'Growth %' },
  { value: 'common-size', label: 'Common Size %' },
  { value: 'per-share', label: 'Per Share' },
];

// Rows already per share (EPS, NAV per share) have no meaningful common size or per-share value.
const PER_SHARE = /PerShare$/;

type Row = FinancialStatement['rows'][number];

const selectClass = 'focus-ring h-8 rounded-md border border-line bg-white px-2 text-[13px] text-ink';

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; disabled?: boolean; title?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-line p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          disabled={o.disabled}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`focus-ring rounded-[5px] px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-200 ${
            value === o.value
              ? 'bg-forest font-medium text-white'
              : 'text-ink/75 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

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

  const [period, setPeriod] = useState<'5' | '10' | 'custom'>('5');
  const [range, setRange] = useState({ from: '', to: '' });
  const [view, setView] = useState<View>('values');
  const [growthYears, setGrowthYears] = useState<GrowthYears>(1);
  const [currency, setCurrency] = useState<'NPR' | 'USD'>('NPR');
  const [heatmap, setHeatmap] = useState(true);

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

  const { symbols, fiscal_years: years, rows, npr_per_usd: nprPerUsd } = state.data;
  const sections = SECTIONS.filter((s) => rows.some((r) => sectionOf(r.order) === s));

  // Fiscal-year labels are zero-padded ("078-079"), so string order is chronological.
  const [from, to] = [range.from || years.at(-1) || '', range.to || years[0] || ''].sort();
  const shown = period === 'custom' ? years.filter((fy) => fy >= from && fy <= to) : years.slice(0, Number(period));

  const rate = currency === 'USD' && nprPerUsd ? nprPerUsd : 1;
  const isPct = view === 'growth-pct' || view === 'common-size';
  const totalAssets = rows.find((r) => r.particulars === 'TotalAssets');
  const operatingIncome = rows.find((r) => r.particulars === 'TotalOperatingIncome');
  const shareCapital = rows.find((r) => r.particulars === 'ShareCapital');
  const num = (row: Row | undefined, fy: string) => toNumber(row?.values[fy]);

  // Growth looks up earlier years in the full data, so the oldest shown year still gets one.
  const compute = (row: Row, fy: string): number | null => {
    const v = num(row, fy);
    switch (view) {
      case 'values':
        return v === null ? null : v / rate;
      case 'growth-amt': {
        const g = growthAmount(v, num(row, shiftFiscalYear(fy, -1)));
        return g === null ? null : g / rate;
      }
      case 'growth-pct':
        return growthPct(v, num(row, shiftFiscalYear(fy, -growthYears)), growthYears);
      case 'common-size': {
        if (PER_SHARE.test(row.particulars)) return null;
        const base = sectionOf(row.order).id === 'balance-sheet' ? totalAssets : operatingIncome;
        return commonSize(v, num(base, fy));
      }
      case 'per-share': {
        if (PER_SHARE.test(row.particulars)) return null;
        const ps = perShare(v, num(shareCapital, fy));
        return ps === null ? null : ps / rate;
      }
    }
  };

  const format = (n: number | null, raw: string | null) => {
    if (n === null) return view === 'values' && raw && toNumber(raw) === null ? raw : '-';
    if (isPct) return `${(n * 100).toFixed(1)}%`;
    if (n === 0) return '-';
    return n.toLocaleString('en-US', { maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2 });
  };

  const heatStyle = (t: number | null): React.CSSProperties | undefined =>
    heatmap && t !== null ? { backgroundColor: heatColor(t) } : undefined;

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

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: '5', label: '5 yrs' },
              { value: '10', label: '10 yrs' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
          {period === 'custom' && (
            <>
              <select
                aria-label="From fiscal year"
                value={from}
                onChange={(e) => setRange({ from: e.target.value, to })}
                className={selectClass}
              >
                {[...years].reverse().map((fy) => (
                  <option key={fy}>{fy}</option>
                ))}
              </select>
              <span className="text-[13px] text-muted">to</span>
              <select
                aria-label="To fiscal year"
                value={to}
                onChange={(e) => setRange({ from, to: e.target.value })}
                className={selectClass}
              >
                {years.map((fy) => (
                  <option key={fy}>{fy}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="View" value={view} onChange={setView} options={VIEWS} />
          {view === 'growth-pct' && (
            <Segmented
              label="Growth basis"
              value={String(growthYears) as '1' | '3' | '5'}
              onChange={(v) => setGrowthYears(Number(v) as GrowthYears)}
              options={[
                { value: '1', label: 'YoY' },
                { value: '3', label: '3 yrs CAGR' },
                { value: '5', label: '5 yrs CAGR' },
              ]}
            />
          )}
        </div>

        <div className="flex items-center gap-4 xl:ml-auto">
          <Segmented
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: 'NPR', label: 'NPR' },
              {
                value: 'USD',
                label: 'USD',
                disabled: !nprPerUsd,
                title: nprPerUsd ? `1 USD = ${nprPerUsd} NPR` : 'No NPR/USD rate configured',
              },
            ]}
          />
          <button
            type="button"
            role="switch"
            aria-checked={heatmap}
            onClick={() => setHeatmap((on) => !on)}
            className="focus-ring flex items-center gap-2 rounded-sm text-[13px] text-ink/75"
          >
            Heatmap
            <span
              className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${heatmap ? 'bg-forest' : 'bg-line'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${heatmap ? 'translate-x-4' : ''}`}
              />
            </span>
          </button>
        </div>
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
          {/* Sized to its columns, so fewer years mean a narrower table, not wider gaps. */}
          <div className="w-fit max-w-full overflow-x-auto rounded-md border border-line">
            <table className="text-sm">
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="sticky left-0 bg-surface px-4 py-3 text-left font-medium text-muted">
                    Particulars
                  </th>
                  {shown.map((fy) => (
                    <th key={fy} scope="col" className="min-w-32 px-4 py-3 text-right font-medium whitespace-nowrap text-ink">
                      {fy}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.flatMap((row, i) => {
                  const cells = shown.map((fy) => compute(row, fy));
                  return [
                    sectionOf(row.order) !== (i > 0 ? sectionOf(rows[i - 1].order) : null) && (
                      <tr key={`section-${i}`} className="border-t border-forest/30 bg-forest/10">
                        <th
                          id={sectionOf(row.order).id}
                          scope="colgroup"
                          colSpan={shown.length + 1}
                          className="scroll-mt-32 px-4 py-3 text-left text-[15px] font-semibold tracking-tight text-forest-dark shadow-[inset_4px_0_0_var(--color-forest)]"
                        >
                          {sectionOf(row.order).title}
                        </th>
                      </tr>
                    ),
                    <tr key={i} className="border-t border-line">
                      <th
                        scope="row"
                        className="sticky left-0 w-44 bg-white px-4 py-2.5 text-left font-normal text-ink sm:w-80"
                      >
                        {humanize(row.particulars)}
                      </th>
                      {shown.map((fy, j) => (
                        <td
                          key={fy}
                          style={heatStyle(heat(cells[j], cells))}
                          className="px-4 py-2.5 text-right whitespace-nowrap tabular-nums text-ink"
                        >
                          {format(cells[j], row.values[fy])}
                        </td>
                      ))}
                    </tr>,
                  ];
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
