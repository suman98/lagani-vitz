import { PageContainer } from '@/components/layout/PageContainer';
import { StockMenu } from '@/components/stock/StockMenu';

export default function StockAnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer className="py-6 sm:py-8">
      <StockMenu />
      <div className="pt-8">{children}</div>
    </PageContainer>
  );
}
