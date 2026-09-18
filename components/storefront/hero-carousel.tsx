'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight } from 'lucide-react';

export type HeroSlide = {
  id: string;
  headline: string;
  subText: string;
  ctaText: string;
  ctaHref: string;
  imageDesktop: string;
  imageMobile?: string;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const items = slides;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pauseHover, setPauseHover] = useState(false);
  const [pauseFocus, setPauseFocus] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIdx(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    if (reduceMotion) return;
    if (pauseHover || pauseFocus) return;
    if (items.length <= 1) return;
    const t = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(t);
  }, [emblaApi, pauseHover, pauseFocus, reduceMotion, items.length]);

  function handleKey(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollNext();
    }
  }

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Featured promotions"
      aria-roledescription="carousel"
      onMouseEnter={() => setPauseHover(true)}
      onMouseLeave={() => setPauseHover(false)}
      onFocus={() => setPauseFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPauseFocus(false);
        }
      }}
      onKeyDown={handleKey}
      tabIndex={0}
      className="relative outline-none focus-visible:ring-2 focus-visible:ring-primary/40 max-lg:overflow-hidden max-lg:rounded-xl lg:overflow-hidden lg:rounded-3xl lg:shadow-[0_20px_60px_-30px_rgba(17,24,39,0.45)]"
    >
      <div className="overflow-hidden max-lg:rounded-xl" ref={emblaRef}>
        <div className="flex">
          {items.map((slide, i) => (
            <div
              key={slide.id}
              className="relative aspect-[2.15/1] min-w-0 flex-[0_0_100%] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/4.2]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
              aria-hidden={i !== selectedIdx}
            >
              {slide.imageMobile ? (
                <>
                  <Image
                    src={slide.imageMobile}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover sm:hidden"
                    aria-hidden
                  />
                  <Image
                    src={slide.imageDesktop}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="hidden object-cover sm:block"
                    aria-hidden
                  />
                </>
              ) : (
                <Image
                  src={slide.imageDesktop}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                  aria-hidden
                />
              )}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent lg:bg-gradient-to-r lg:from-foreground/72 lg:via-foreground/30 lg:to-foreground/10"
                aria-hidden
              />

              {/* Mobile: headline, description, CTA */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-3 pb-6 lg:hidden">
                <h2 className="line-clamp-2 font-display text-base font-bold leading-snug text-white">
                  {slide.headline}
                </h2>
                {slide.subText ? (
                  <p className="mt-1 line-clamp-2 text-xs text-white/90">
                    {slide.subText}
                  </p>
                ) : null}
                <Link
                  href={slide.ctaHref}
                  className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
                >
                  {slide.ctaText || 'Shop now'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Desktop: headline, description, CTA */}
              <div className="absolute inset-0 z-10 hidden items-center lg:flex">
                <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
                  <div className="max-w-2xl text-white">
                    <h2 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-4xl lg:text-[2.45rem] lg:leading-[1.08]">
                      {slide.headline}
                    </h2>
                    {slide.subText ? (
                      <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base lg:text-base">
                        {slide.subText}
                      </p>
                    ) : null}
                    <Link
                      href={slide.ctaHref}
                      className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-primary/40 lg:rounded-lg lg:px-4 lg:py-2.5 lg:text-sm"
                    >
                      {slide.ctaText || 'Shop now'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 lg:bottom-3">
          {items.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === selectedIdx}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full bg-white/70 transition-all ${
                i === selectedIdx ? 'w-6 bg-white' : 'w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
