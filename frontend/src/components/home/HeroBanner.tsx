import Image from 'next/image';
import banner from '@/images/banner.webp';

export function HeroBanner() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto w-full max-w-[1440px] sm:px-4 sm:pt-4">
      <div className="relative h-[72svh] min-h-[460px] max-h-[760px] overflow-hidden bg-forest-dark sm:rounded-lg">
        <Image
          src={banner}
          alt="Snow-covered Himalayan peaks under a clear blue sky"
          fill
          priority
          sizes="(min-width: 1440px) 1440px, 100vw"
          className="object-cover object-[62%_bottom]"
        />
        {/* Keeps the headline legible over the bright snow on narrow crops. */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-transparent" />

        <div className="relative flex h-full flex-col items-center px-6 pt-[clamp(3.5rem,11svh,7rem)] text-center">
          <p className="animate-fade-up text-sm font-medium tracking-[0.18em] text-white/80 uppercase">Lagani Viz</p>
          <h1
            id="hero-title"
            className="animate-fade-up mt-4 max-w-[14ch] text-[2.75rem] leading-[1.05] font-semibold tracking-tight text-white [animation-delay:80ms] sm:text-6xl lg:text-7xl"
          >
            Value Investing Platform
          </h1>
        </div>
      </div>
    </section>
  );
}
