import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';

// Exported as 404.html; Laravel returns it with a 404 status for unknown /lagani/* paths.
export default function NotFound() {
  return (
    <PageContainer className="py-10 sm:py-16">
      <section className="state">
        <h1>Page not found</h1>
        <p className="muted">That page does not exist.</p>
        <Link href="/" className="button">
          Back to home
        </Link>
      </section>
    </PageContainer>
  );
}
