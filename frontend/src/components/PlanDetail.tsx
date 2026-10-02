'use client';

import DOMPurify from 'dompurify';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ApiError, formatNpr, getPlan } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { RiskBadge } from './RiskBadge';

export function PlanDetail() {
  const slug = useSearchParams().get('slug');
  const { state, retry } = useAsync(
    (signal) => (slug ? getPlan(slug, signal) : Promise.reject(new ApiError('Not found', 404))),
    [slug],
  );

  // The body is authored in the Filament rich editor; sanitize before injecting.
  const bodyHtml = useMemo(
    () => (state.status === 'ready' && state.data.body ? DOMPurify.sanitize(state.data.body) : null),
    [state],
  );

  if (state.status === 'loading') return <p className="muted">Loading…</p>;

  if (state.status === 'error') {
    const missing = state.error instanceof ApiError && state.error.status === 404;
    return (
      <div className="state" role="alert">
        <p>{missing ? 'This plan does not exist or is no longer published.' : `${state.error.message}.`}</p>
        {missing ? (
          <Link href="/" className="button">
            Back to plans
          </Link>
        ) : (
          <button className="button" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  const plan = state.data;
  return (
    <article className="detail">
      <Link href="/" className="muted back">
        ← All plans
      </Link>
      <RiskBadge level={plan.risk_level} />
      <h1>{plan.title}</h1>
      {plan.summary && <p className="lead">{plan.summary}</p>}
      <dl className="facts">
        {plan.expected_return_pct !== null && (
          <div>
            <dt>Expected return</dt>
            <dd>{plan.expected_return_pct}%</dd>
          </div>
        )}
        {plan.min_amount !== null && (
          <div>
            <dt>Minimum</dt>
            <dd>{formatNpr(plan.min_amount)}</dd>
          </div>
        )}
        {plan.duration_months !== null && (
          <div>
            <dt>Duration</dt>
            <dd>{plan.duration_months} months</dd>
          </div>
        )}
      </dl>
      {bodyHtml && <div className="prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />}
    </article>
  );
}
