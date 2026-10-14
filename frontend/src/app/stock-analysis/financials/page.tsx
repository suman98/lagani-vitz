import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Financials } from '@/components/stock/Financials';

export const metadata: Metadata = { title: 'Financials' };

export default function FinancialsPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <Financials />
    </Suspense>
  );
}
