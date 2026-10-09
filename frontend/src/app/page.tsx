import { HeroBanner } from '@/components/home/HeroBanner';
import { IndexChart } from '@/components/home/IndexChart';
import { MarketSummary } from '@/components/home/MarketSummary';
import { Section } from '@/components/home/Section';
import { SectorPerformance } from '@/components/home/SectorPerformance';
import { TopMovers } from '@/components/home/TopMovers';
import { PageContainer } from '@/components/layout/PageContainer';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <PageContainer className="flex flex-col gap-12 py-12 sm:py-16">
        <Section title="Market summary">
          <MarketSummary />
        </Section>
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-8">
          <Section title="NEPSE index">
            <IndexChart />
          </Section>
          <Section title="Sector performance">
            <SectorPerformance />
          </Section>
        </div>
        <Section title="Top movers">
          <TopMovers />
        </Section>
      </PageContainer>
    </>
  );
}
