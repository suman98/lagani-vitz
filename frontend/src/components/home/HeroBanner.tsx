import Image from 'next/image';
import banner from '@/images/Banner.jpg';

export function HeroBanner() {
  return (
    <section aria-labelledby="hero-title" className="w-full px-2 pt-2">
      <div className="relative h-[44svh] min-h-[280px] max-h-[460px] overflow-hidden rounded-md bg-forest-dark">
        <Image
          src={banner}
          alt="Kathmandu cityscape with the Himalayas behind"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_35%]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/45 to-black/25" />

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="animate-fade-up text-xs font-medium tracking-[0.18em] text-white/85 uppercase sm:text-sm">
            Lagani Viz
          </p>
          <h1
            id="hero-title"
            className="animate-fade-up mt-3 max-w-[18ch] text-4xl leading-[1.05] font-semibold tracking-tight text-white [animation-delay:80ms] sm:text-5xl lg:text-6xl"
          >
            Value Investing Platform for Nepal Stock Market
          </h1>
        </div>
      </div>
    </section>
  );
}
