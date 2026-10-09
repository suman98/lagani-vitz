import { movers } from '@/lib/sampleData';
import { Change } from './Section';

function MoversTable({ caption, rows }: { caption: string; rows: (typeof movers)['gainers'] }) {
  return (
    <table className="w-full text-sm">
      <caption className="pb-2 text-left text-xs font-medium tracking-wide text-muted uppercase">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th>Symbol</th>
          <th>LTP</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.symbol} className="border-t border-line">
            <td className="py-2.5">
              <span className="font-medium text-ink">{r.symbol}</span>
              <span className="block truncate text-xs text-muted">{r.name}</span>
            </td>
            <td className="py-2.5 text-right tabular-nums text-ink">{r.ltp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td className="w-24 py-2.5 text-right">
              <Change value={r.change} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TopMovers() {
  return (
    <div className="grid gap-8 rounded-md border border-line p-5 sm:grid-cols-2">
      <MoversTable caption="Top gainers" rows={movers.gainers} />
      <MoversTable caption="Top losers" rows={movers.losers} />
    </div>
  );
}
