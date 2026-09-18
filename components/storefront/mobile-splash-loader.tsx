'use client';

import { useEffect, useState } from 'react';

const PRODUCE = ['🥦', '🍎', '🥕', '🍅', '🫑', '🍇', '🥬', '🍋'] as const;

export function MobileSplashLoader() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop) return;

    setVisible(true);
    const fadeTimer = window.setTimeout(() => setFadeOut(true), 1600);
    const hideTimer = window.setTimeout(() => setVisible(false), 2200);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white transition-opacity duration-500 lg:hidden ${
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={fadeOut}
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-end justify-center gap-2 sm:gap-3">
        {PRODUCE.slice(0, 4).map((emoji, i) => (
          <span
            key={emoji}
            className="animate-bounce text-3xl sm:text-4xl"
            style={{ animationDelay: `${i * 0.12}s`, animationDuration: '0.9s' }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-end justify-center gap-2 sm:gap-3">
        {PRODUCE.slice(4).map((emoji, i) => (
          <span
            key={emoji}
            className="animate-bounce text-3xl sm:text-4xl"
            style={{ animationDelay: `${(i + 4) * 0.12}s`, animationDuration: '0.9s' }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <p className="mt-8 max-w-[260px] px-6 text-center text-sm font-medium text-muted-foreground">
        Fresh fruits &amp; vegetables, delivered to your business
      </p>
      <div className="mt-6 h-1 w-24 overflow-hidden rounded-full bg-primary/15">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}
