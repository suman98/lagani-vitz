export type View = 'values' | 'growth-amt' | 'growth-pct' | 'common-size' | 'per-share';
/** Growth% basis in years: 1 = YoY, 3 / 5 = CAGR. */
export type GrowthYears = 1 | 3 | 5;

export const toNumber = (v: string | null | undefined): number | null =>
  v && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : null;

/** "082-083" shifted by -3 -> "079-080". Works on labels, so a missing year yields no match instead of a wrong one. */
export const shiftFiscalYear = (fy: string, by: number) =>
  fy.replace(/\d+/g, (n) => String(Number(n) + by).padStart(n.length, '0'));

export const growthAmount = (cur: number | null, prev: number | null) =>
  cur === null || prev === null ? null : cur - prev;

/** YoY uses |base| so a loss shrinking reads as positive growth; CAGR is undefined unless both ends are positive. */
export function growthPct(cur: number | null, base: number | null, years: GrowthYears): number | null {
  if (cur === null || base === null || base === 0) return null;
  if (years === 1) return (cur - base) / Math.abs(base);
  if (cur <= 0 || base <= 0) return null;
  return (cur / base) ** (1 / years) - 1;
}

export const commonSize = (v: number | null, base: number | null) => (v === null || !base ? null : v / base);

/** Nepal bank shares have NPR 100 par value, so share count = share capital / 100. */
export const perShare = (v: number | null, shareCapital: number | null) =>
  v === null || !shareCapital ? null : v / (shareCapital / 100);

/** 0..1 position of `v` between the row's min and max; null when the row has no spread. */
export function heat(v: number | null, row: (number | null)[]): number | null {
  const nums = row.filter((n): n is number => n !== null);
  if (v === null || nums.length < 2) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return max === min ? null : (v - min) / (max - min);
}

// Excel's "Green - Yellow - Red" color scale stops.
const RED = [248, 105, 107];
const YELLOW = [255, 235, 132];
const GREEN = [99, 190, 123];

/** Color for heat position t (0 = row min, 1 = row max), interpolated like Excel's 3-color scale. */
export function heatColor(t: number): string {
  const [a, b, k] = t < 0.5 ? [RED, YELLOW, t * 2] : [YELLOW, GREEN, (t - 0.5) * 2];
  return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * k)).join(', ')})`;
}
