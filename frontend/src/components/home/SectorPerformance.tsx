import { sectors } from '@/lib/sampleData';
import { Change } from './Section';

export function SectorPerformance() {
  const max = Math.max(...sectors.map((s) => Math.abs(s.change)));
  return (
    <ul className="flex flex-col gap-3 rounded-md border border-line p-5">
      {sectors.map((s) => (
        <li key={s.name} className="grid grid-cols-[8.5rem_1fr_4.5rem] items-center gap-3 text-sm">
          <span className="truncate text-ink">{s.name}</span>
          <span className="relative h-2.5" aria-hidden="true">
            <span className="absolute inset-y-0 left-1/2 w-px bg-line" />
            <span
              className={`absolute inset-y-0 ${s.change >= 0 ? 'left-1/2 rounded-r bg-gain' : 'right-1/2 rounded-l bg-loss'}`}
              style={{ width: `${(Math.abs(s.change) / max) * 50}%` }}
            />
          </span>
          <span className="text-right">
            <Change value={s.change} />
          </span>
        </li>
      ))}
    </ul>
  );
}
