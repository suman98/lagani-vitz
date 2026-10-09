import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PlanDetail } from '@/components/PlanDetail';

// Static export cannot pre-render slugs that only exist in the database, so the
// detail view is one page that reads `?slug=` on the client.
export default function PlanPage() {
  return (
    <PageContainer className="py-10 sm:py-16">
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <PlanDetail />
      </Suspense>
    </PageContainer>
  );
}
