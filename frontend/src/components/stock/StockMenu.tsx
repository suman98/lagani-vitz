'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STOCK_TABS } from '@/lib/stockTabs';

export function StockMenu() {
  const pathname = usePathname().replace(/\/$/, '');

  return (
    <nav aria-label="Stock analysis" className="border-b border-line">
      <ul className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:thin]">
        {STOCK_TABS.map(({ slug, label }) => {
          const href = slug ? `/stock-analysis/${slug}` : '/stock-analysis';
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`focus-ring block border-b-2 py-3 text-[15px] whitespace-nowrap transition-colors duration-200 ${
                  active ? 'border-forest font-medium text-forest' : 'border-transparent text-ink/70 hover:text-ink'
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
