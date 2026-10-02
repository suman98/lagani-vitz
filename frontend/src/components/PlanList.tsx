'use client';

import { getPlans } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { PlanCard } from './PlanCard';

export function PlanList() {
  const { state, retry } = useAsync((signal) => getPlans(signal), []);

  if (state.status === 'loading') {
    return (
      <div className="grid" aria-busy="true" aria-label="Loading plans">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card skeleton" />
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="state" role="alert">
        <p>Could not load plans. {state.error.message}.</p>
        <button className="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  if (state.data.length === 0) {
    return <p className="state muted">No plans are published yet.</p>;
  }

  return (
    <div className="grid">
      {state.data.map((plan) => (
        <PlanCard key={plan.slug} plan={plan} />
      ))}
    </div>
  );
}
