'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { SectionHeader } from './section-header';
import type { RecentlyViewedItem } from '@/lib/types';

const STORAGE_KEY = 'dmartbrandon_recently_viewed';

export function RecentlyViewedRail() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as RecentlyViewedItem[];
      setItems(stored);
      const slugs = stored.map((i) => i.slug).join(',');
      if (slugs) {
        fetch(`/api/products?slugs=${encodeURIComponent(slugs)}`)
          .then((r) => r.json())
          .then((data) => {
            const validSlugs = new Set(
              (Array.isArray(data) ? data : data.products ?? []).map(
                (p: { slug: string }) => p.slug,
              ),
            );
            const filtered = stored.filter((i) => validSlugs.has(i.slug));
            if (filtered.length !== stored.length) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
              setItems(filtered);
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setItems([]);
  }

  if (!mounted || items.length < 4) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <SectionHeader title="Recently viewed" />
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      </div>
      <div className="-mx-4 overflow-x-auto scrollbar-none px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid snap-x snap-mandatory scroll-smooth grid-flow-col auto-cols-[40%] gap-3 sm:auto-cols-[24%] md:auto-cols-[18%] lg:auto-cols-[14%]">
          {items.map((it) => (
            <Link
              key={it.slug}
              href={`/products/${it.slug}`}
              prefetch
              className="group flex snap-start flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="relative aspect-square bg-secondary">
                {it.image && (
                  <Image
                    src={it.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    aria-hidden
                  />
                )}
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium">{it.name}</p>
                <p className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                  ₹{it.price}
                  <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                    /{it.unit}
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
