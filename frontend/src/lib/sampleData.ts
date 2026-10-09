// Illustrative placeholder data for the home page. Not real market data.

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function walk(seed: number, length: number, start: number, volatility: number) {
  const rand = seeded(seed);
  const out = [start];
  for (let i = 1; i < length; i++) out.push(+(out[i - 1] * (1 + (rand() - 0.48) * volatility)).toFixed(2));
  return out;
}

const DAY_MS = 86_400_000;
const END = Date.UTC(2026, 9, 8);

export const indexSeries = walk(7, 90, 2480, 0.018).map((value, i, all) => ({
  date: new Date(END - (all.length - 1 - i) * DAY_MS),
  value,
}));

export const summary = [
  { label: 'NEPSE Index', value: '2,612.48', change: 1.24, spark: walk(11, 30, 100, 0.02) },
  { label: 'Sensitive Index', value: '448.91', change: 0.86, spark: walk(23, 30, 100, 0.02) },
  { label: 'Float Index', value: '181.37', change: -0.42, spark: walk(5, 30, 100, 0.02) },
  { label: 'Turnover (NPR)', value: '6.84 Arba', change: 12.6, spark: walk(41, 30, 100, 0.05) },
];

export const sectors = [
  { name: 'Hydropower', change: 3.42 },
  { name: 'Microfinance', change: 2.18 },
  { name: 'Life Insurance', change: 1.05 },
  { name: 'Commercial Banks', change: 0.64 },
  { name: 'Manufacturing', change: -0.31 },
  { name: 'Development Banks', change: -0.88 },
  { name: 'Hotels & Tourism', change: -1.47 },
  { name: 'Finance', change: -2.12 },
];

// Fictional companies, so placeholder prices are never mistaken for real listings.
export const movers = {
  gainers: [
    { symbol: 'HMHY', name: 'Himal Hydro', ltp: 412.3, change: 9.98 },
    { symbol: 'KLBK', name: 'Kali Bank', ltp: 688.0, change: 7.41 },
    { symbol: 'SGLM', name: 'Sagar Laghubitta', ltp: 501.2, change: 5.22 },
    { symbol: 'ANLI', name: 'Annapurna Life', ltp: 1204.0, change: 4.85 },
    { symbol: 'BGPW', name: 'Bagmati Power', ltp: 236.5, change: 4.1 },
  ],
  losers: [
    { symbol: 'PKHT', name: 'Pokhara Hotels', ltp: 702.0, change: -6.3 },
    { symbol: 'TRFN', name: 'Terai Finance', ltp: 598.4, change: -4.92 },
    { symbol: 'MCDB', name: 'Machhapuchhre Dev Bank', ltp: 1045.0, change: -3.75 },
    { symbol: 'GDCM', name: 'Gandaki Cement', ltp: 515.0, change: -3.11 },
    { symbol: 'LMIT', name: 'Lumbini Investment', ltp: 2310.0, change: -2.64 },
  ],
};
