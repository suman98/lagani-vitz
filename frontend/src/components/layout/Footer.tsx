import { PageContainer } from './PageContainer';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <PageContainer className="flex flex-col gap-1 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-medium text-ink">Lagani Viz</span> · Value Investing Platform
        </p>
        <p>© {new Date().getFullYear()} Lagani Viz. All rights reserved.</p>
      </PageContainer>
    </footer>
  );
}
