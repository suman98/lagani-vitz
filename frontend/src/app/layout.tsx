import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lagani — investment plans',
  description: 'Browse curated lagani (investment) plans.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand">
              Lagani
            </Link>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
