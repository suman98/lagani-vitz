'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageContainer } from './PageContainer';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/sector-analysis', label: 'Sector Analysis' },
  { href: '/stock-analysis', label: 'Stock Analysis' },
  { href: '/screener', label: 'Screener' },
  { href: '/investing-signals', label: 'Investing Signals & Alerts' },
  { href: '/value-chart', label: 'Value Chart' },
];

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <PageContainer className="flex h-14 items-center justify-between gap-8">
        <Link href="/" className="focus-ring rounded-sm text-[25px] font-semibold tracking-tight text-ink">
          Lagani Viz
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {LINKS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`focus-ring rounded-sm text-[13px] transition-colors duration-200 ${
                      active ? 'font-medium text-forest' : 'text-ink/70 hover:text-ink'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="focus-ring -mr-2 flex h-10 w-10 items-center justify-center rounded-sm text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 6h14M2 12h14" />}
          </svg>
        </button>
      </PageContainer>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-white lg:hidden">
          <PageContainer>
            <ul className="py-3">
              {LINKS.map(({ href, label }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href} className="border-b border-line last:border-0">
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`focus-ring flex py-3.5 text-[17px] ${active ? 'font-medium text-forest' : 'text-ink'}`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </PageContainer>
        </nav>
      )}
    </header>
  );
}
