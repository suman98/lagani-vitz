'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STOCK_TABS } from '@/lib/stockTabs';

export function StockMenu() {
  const pathname = usePathname().replace(/\/$/, '');

  return (
    <nav aria-label="Stock analysis" className="border-b border-line">
      <ul className="-mb-px flex overflow-x-auto [scrollbar-width:none] xl:justify-center">
        {STOCK_TABS.map(({ slug, label }) => {
          const href = slug ? `/stock-analysis/${slug}` : '/stock-analysis';
          const active = pathname === href;
          return (
            <li
              key={href}
              className="flex shrink-0 items-center before:h-4 before:w-px before:bg-line before:content-[''] first:before:hidden"
            >
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`focus-ring mx-2 block border-b-2 py-3 text-[14px] whitespace-nowrap transition-colors duration-200 ${
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
