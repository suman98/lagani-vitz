'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import himalaya from '@/images/banner.webp';
import pokhara from '@/images/BannerPokhara.jpg';
import skyline from '@/images/bannerSkyscaper.webp';
import bull from '@/images/BannerBull.webp';

const SLIDES = [
  { src: himalaya, alt: 'Snow-covered Himalayan peaks under a clear blue sky', position: 'object-[62%_45%]' },
  { src: pokhara, alt: 'Phewa Lake in Pokhara reflecting the Annapurna range', position: 'object-[50%_40%]' },
  { src: skyline, alt: 'City skyline rising above a green park', position: 'object-[50%_60%]' },
  { src: bull, alt: 'Illustration of a bull climbing a rising market chart', position: 'object-center' },
];

const INTERVAL_MS = 5000;

export function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      className="mx-auto w-full max-w-[1440px] sm:px-4 sm:pt-4"
    >
      <div className="relative h-[36svh] min-h-[240px] max-h-[380px] overflow-hidden bg-forest-dark sm:rounded-lg">
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.alt}
            src={slide.src}
            alt={slide.alt}
            aria-hidden={i !== index}
            fill
            priority={i === 0}
            sizes="(min-width: 1440px) 1440px, 100vw"
            className={`object-cover ${slide.position} transition-opacity duration-1000 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Uniform scrim: the slides range from deep sky to a pale illustration. */}
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" />

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="animate-fade-up text-xs font-medium tracking-[0.18em] text-white/85 uppercase sm:text-sm">
            Lagani Viz
          </p>
          <h1
            id="hero-title"
            className="animate-fade-up mt-3 max-w-[14ch] text-4xl leading-[1.05] font-semibold tracking-tight text-white [animation-delay:80ms] sm:text-5xl lg:text-6xl"
          >
            Value Investing Platform
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
          className="focus-ring absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            {paused ? <path d="M2 1l9 5-9 5z" /> : <path d="M2 1h3v10H2zM7 1h3v10H7z" />}
          </svg>
        </button>
      </div>
    </section>
  );
}
