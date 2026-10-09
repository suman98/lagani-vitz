import Image from 'next/image';
import banner from '@/images/Banner.jpg';

export function HeroBanner() {
  return (
    <section aria-labelledby="hero-title" className="w-full px-2 pt-2">
      <div className="relative mx-auto overflow-hidden rounded-md bg-navy md:flex md:w-[98%] md:items-center">
        <div className="relative aspect-[1024/365] w-full shrink-0 md:w-[64%]">
          <Image
            src={banner}
            alt="Investors reviewing market charts in an office overlooking Kathmandu and the Himalayas"
            fill
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover object-top"
          />
          {/* Fades the photo into the panel behind the text: downward on mobile, rightward on desktop. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-navy md:bg-gradient-to-r md:from-55%"
          />
        </div>

        <div className="relative -mt-10 px-6 pb-10 sm:px-10 md:mt-0 md:-ml-[10%] md:flex-1 md:pr-12 md:pb-0 lg:pr-16">
          <p className="animate-fade-up text-sm font-medium tracking-[0.18em] text-white/75 uppercase sm:text-lg">
            Lagani Viz
          </p>
          <h1
            id="hero-title"
            className="animate-fade-up mt-3 text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-white [animation-delay:80ms] sm:text-4xl lg:text-5xl"
          >
            Value Investing Platform for <span className="text-forest-light">Nepal Stock Market</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
