'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

function SearchField({ inputRef, className = '' }: { inputRef?: React.Ref<HTMLInputElement>; className?: string }) {
  return (
    // ponytail: no search backend yet, submit is a no-op; wire to a results route when one exists.
    <form role="search" onSubmit={(e) => e.preventDefault()} className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3.5 3.5" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        aria-label="Search"
        placeholder="Search (Ctrl+K)"
        className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-[15px] text-ink placeholder:text-muted focus:border-forest focus:bg-white focus:outline-none"
      />
    </form>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && searchRef.current?.offsetParent) {
        e.preventDefault();
        searchRef.current.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="flex h-16 items-center justify-between gap-8 px-5 sm:px-8 xl:grid xl:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="focus-ring justify-self-start rounded-sm text-[25px] font-semibold tracking-tight text-ink">
          LaganiViz
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          <SearchField inputRef={searchRef} className="w-52" />
          <nav aria-label="Main">
            <ul className="flex items-center gap-6">
              {LINKS.map(({ href, label }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`focus-ring rounded-sm text-[16px] transition-colors duration-200 ${
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
        </div>

        <button
          type="button"
          className="focus-ring -mr-2 flex h-10 w-10 items-center justify-center justify-self-end rounded-sm text-ink xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 6h14M2 12h14" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-white xl:hidden">
          <PageContainer>
            <SearchField className="mt-4" />
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
