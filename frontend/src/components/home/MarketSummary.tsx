import { summary } from '@/lib/sampleData';
import { Change } from './Section';

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const span = Math.max(...data) - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className={up ? 'text-gain' : 'text-loss'}
      />
    </svg>
  );
}

export function MarketSummary() {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-4">
      {summary.map((s) => (
        <li key={s.label} className="flex flex-col gap-2 bg-white p-5">
          <span className="text-xs text-muted">{s.label}</span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink">{s.value}</span>
          <span className="text-sm">
            <Change value={s.change} />
          </span>
          <Sparkline data={s.spark} up={s.change >= 0} />
        </li>
      ))}
    </ul>
  );
}
