import { PlanList } from '@/components/PlanList';

export default function HomePage() {
  return (
    <>
      <section className="intro">
        <h1>Investment plans</h1>
        <p>Curated lagani options, from steady and low-risk to growth-oriented.</p>
      </section>
      <PlanList />
    </>
  );
}
