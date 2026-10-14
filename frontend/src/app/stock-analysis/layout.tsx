import { PageContainer } from '@/components/layout/PageContainer';
import { StockMenu } from '@/components/stock/StockMenu';

export default function StockAnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-8 sm:pt-8">
        <StockMenu />
      </div>
      <PageContainer className="pt-8 pb-6 sm:pb-8">{children}</PageContainer>
    </>
  );
}
