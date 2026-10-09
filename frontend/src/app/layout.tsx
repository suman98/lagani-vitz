import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: { default: 'Lagani Viz — Value Investing Platform', template: '%s · Lagani Viz' },
  description: 'Lagani Viz is a value investing platform for financial analysis and investment research.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex min-h-svh flex-col">
        <a href="#main" className="focus-ring sr-only z-50 bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
