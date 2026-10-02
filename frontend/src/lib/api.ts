export type RiskLevel = 'low' | 'medium' | 'high';

export interface Plan {
  slug: string;
  title: string;
  summary: string | null;
  risk_level: RiskLevel;
  min_amount: number | null;
  expected_return_pct: number | null;
  duration_months: number | null;
  /** Only present on the detail endpoint. */
  body?: string | null;
}

// Same origin as the page: Laravel serves both the HTML shell and /lagani/api/v1.
// In `next dev`, next.config.mjs proxies /lagani/api/* to Laravel.
const API_BASE =
  process.env.NEXT_PUBLIC_LAGANI_API ?? `${process.env.NEXT_PUBLIC_LAGANI_BASE_PATH}/api/v1`;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new ApiError(res.status === 404 ? 'Not found' : `Request failed (${res.status})`, res.status);
  }
  return (await res.json()) as T;
}

export async function getPlans(signal?: AbortSignal): Promise<Plan[]> {
  return (await get<{ data: Plan[] }>('/plans', signal)).data;
}

export async function getPlan(slug: string, signal?: AbortSignal): Promise<Plan> {
  return (await get<{ data: Plan }>(`/plans/${encodeURIComponent(slug)}`, signal)).data;
}

export const formatNpr = (amount: number) =>
  new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(amount);
