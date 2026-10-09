'use client';

import { useEffect, useRef, useState } from 'react';
import { indexSeries } from '@/lib/sampleData';

const H = 260;
const PAD = { top: 12, right: 12, bottom: 28, left: 48 };

const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtNum = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function IndexChart() {
  const [hover, setHover] = useState<number | null>(null);
  const [W, setW] = useState(720);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(([entry]) => setW(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const values = indexSeries.map((p) => p.value);
  const min = Math.floor(Math.min(...values) / 50) * 50;
  const max = Math.ceil(Math.max(...values) / 50) * 50;
  const x = (i: number) => PAD.left + (i / (indexSeries.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);
  const line = indexSeries.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join('');
  const area = `${line}L${x(indexSeries.length - 1)},${H - PAD.bottom}L${x(0)},${H - PAD.bottom}Z`;
  const ticks = Array.from({ length: 5 }, (_, i) => min + ((max - min) / 4) * i);
  const xTicks = W < 480 ? [0, indexSeries.length - 1] : [0, 30, 60, indexSeries.length - 1];
  const point = hover === null ? null : indexSeries[hover];

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - box.left) / box.width;
    setHover(Math.max(0, Math.min(indexSeries.length - 1, Math.round(ratio * (indexSeries.length - 1)))));
  };

  const last = indexSeries[indexSeries.length - 1];

  return (
    <div className="rounded-md border border-line p-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted">NEPSE Index · last 90 days</p>
        <p className="text-sm tabular-nums text-ink" aria-live="polite">
          {point ? (
            <>
              {fmtDate(point.date)} · <span className="font-semibold">{fmtNum(point.value)}</span>
            </>
          ) : (
            <span className="font-semibold">{fmtNum(last.value)}</span>
          )}
        </p>
      </div>
      <div ref={box}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block max-w-full" role="img" aria-label="Line chart of the NEPSE index over the last 90 days (sample data)">
        <defs>
          <linearGradient id="index-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-forest)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--color-forest)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-line)" />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
              {Math.round(t).toLocaleString('en-US')}
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === indexSeries.length - 1 ? 'end' : 'middle'} className="fill-muted text-[11px]">
            {fmtDate(indexSeries[i].date)}
          </text>
        ))}
        <path d={area} fill="url(#index-fill)" />
        <path d={line} fill="none" stroke="var(--color-forest)" strokeWidth="2" strokeLinejoin="round" />
        {point && hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-muted)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(point.value)} r="5" fill="var(--color-forest)" stroke="white" strokeWidth="2" />
          </g>
        )}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={W - PAD.left - PAD.right}
          height={H - PAD.top - PAD.bottom}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      </div>
    </div>
  );
}
