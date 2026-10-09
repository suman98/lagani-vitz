import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Screener' };

export default function ScreenerPage() {
  return <h1 className="sr-only">Screener</h1>;
}
