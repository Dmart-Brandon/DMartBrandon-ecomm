'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * 2px top-of-page progress bar that animates while the next route resolves.
 * Pure CSS — no NProgress dep. Triggers on Link click + path change.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const fadeRef = useRef<NodeJS.Timeout | null>(null);

  // Capture link clicks anywhere on the page so the bar appears immediately
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      // Bail out for clicks inside open popovers / menus / dialogs / Clerk portals.
      // Those rarely lead to actual navigation, and the progress bar flicker is noise.
      if (
        target.closest(
          '[role="dialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper], [data-clerk-modal], [data-clerk-portal]'
        )
      ) {
        return;
      }
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }
      start();
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Reset / complete when the route changes
  useEffect(() => {
    complete();
  }, [pathname, searchParams]);

  function start() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);
    setActive(true);
    setProgress(8);
    tickRef.current = setInterval(() => {
      setProgress((p) => {
        if (p < 70) return p + Math.random() * 12;
        if (p < 88) return p + Math.random() * 3;
        return p;
      });
    }, 240);
  }

  function complete() {
    if (tickRef.current) clearInterval(tickRef.current);
    setProgress(100);
    fadeRef.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 220);
  }

  if (!active && progress === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_rgba(22,163,74,0.6)] transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}
