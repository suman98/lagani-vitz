import Link from 'next/link';
import { formatNpr, type Plan } from '@/lib/api';
import { RiskBadge } from './RiskBadge';

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article className="card">
      <RiskBadge level={plan.risk_level} />
      <h2>
        <Link href={`/plan?slug=${encodeURIComponent(plan.slug)}`}>{plan.title}</Link>
      </h2>
      {plan.summary && <p className="muted">{plan.summary}</p>}
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
            <dd>{plan.duration_months} mo</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
