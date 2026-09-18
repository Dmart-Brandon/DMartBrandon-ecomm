'use client';

import { useEffect } from 'react';
import type { RecentlyViewedItem } from '@/lib/types';

const STORAGE_KEY = 'dmartbrandon_recently_viewed';
const MAX = 12;

export function RecordRecentlyViewed({
  item,
}: {
  item: Omit<RecentlyViewedItem, 'viewedAt'>;
}) {
  useEffect(() => {
    if (!item.slug) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
      const next: RecentlyViewedItem[] = [
        { ...item, viewedAt: Date.now() },
        ...list.filter((i) => i.slug !== item.slug),
      ].slice(0, MAX);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [item]);

  return null;
}
