import { Suspense } from 'react';
import { PlanDetail } from '@/components/PlanDetail';

// Static export cannot pre-render slugs that only exist in the database, so the
// detail view is one page that reads `?slug=` on the client.
export default function PlanPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <PlanDetail />
    </Suspense>
  );
}
