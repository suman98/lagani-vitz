import type { RiskLevel } from '@/lib/api';

const LABEL: Record<RiskLevel, string> = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' };

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`badge badge-${level}`}>{LABEL[level] ?? level}</span>;
}
