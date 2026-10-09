export function Section({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={className}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        <span className="text-xs text-muted">Sample data</span>
      </div>
      {children}
    </section>
  );
}

export function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 tabular-nums text-ink">
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" className={up ? 'text-gain' : 'text-loss'}>
        <path d={up ? 'M4 1l3.5 6h-7z' : 'M4 7L.5 1h7z'} fill="currentColor" />
      </svg>
      {up ? '+' : '−'}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}
