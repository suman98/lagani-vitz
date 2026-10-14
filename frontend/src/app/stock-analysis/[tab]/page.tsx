import type { Metadata } from 'next';
import { STOCK_TABS } from '@/lib/stockTabs';

// Tabs with content get their own folder (e.g. financials/), which wins over this route.
const EMPTY_TABS = STOCK_TABS.filter((t) => t.slug && t.slug !== 'financials');

export const dynamicParams = false;

export function generateStaticParams() {
  return EMPTY_TABS.map((t) => ({ tab: t.slug }));
}

type Props = { params: Promise<{ tab: string }> };

const labelOf = async (params: Props['params']) => {
  const { tab } = await params;
  return EMPTY_TABS.find((t) => t.slug === tab)!.label;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: await labelOf(params) };
}

export default async function StockTabPage({ params }: Props) {
  return <h1 className="sr-only">{await labelOf(params)}</h1>;
}
