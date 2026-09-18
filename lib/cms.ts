import { connectToDatabase } from '@/lib/mongodb';
import { HeroSlide } from '@/lib/models/HeroSlide';
import { Announcement } from '@/lib/models/Announcement';
import { Featured } from '@/lib/models/Featured';
import type { HeroSlide as HeroSlideComponent } from '@/components/storefront/hero-carousel';
import type { AnnouncementDoc, FeaturedDoc } from '@/lib/types';

/**
 * Returns true if a doc with optional `startsAt`/`endsAt` is within its
 * scheduled window right now.
 */
function withinWindow(doc: { startsAt?: Date | null; endsAt?: Date | null }) {
  const now = Date.now();
  if (doc.startsAt) {
    const start = new Date(doc.startsAt);
    // If only a date is stored (00:00), treat it as start-of-day.
    if (
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      start.getSeconds() === 0 &&
      start.getMilliseconds() === 0
    ) {
      start.setHours(0, 0, 0, 0);
    }
    if (start.getTime() > now) return false;
  }
  if (doc.endsAt) {
    const end = new Date(doc.endsAt);
    // Respect exact time when provided. If only date exists (00:00), keep
    // prior inclusive-day behavior by extending to end-of-day.
    if (
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      end.getSeconds() === 0 &&
      end.getMilliseconds() === 0
    ) {
      end.setHours(23, 59, 59, 999);
    }
    if (end.getTime() < now) return false;
  }
  return true;
}

export async function getActiveHeroSlides(): Promise<HeroSlideComponent[]> {
  try {
    await connectToDatabase();
    const docs = await HeroSlide.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    return (docs as any[])
      .filter((d) => withinWindow(d))
      .map((d) => ({
        id: d._id.toString(),
        headline: d.headline,
        subText: d.subText ?? '',
        ctaText: d.ctaText ?? 'Shop now',
        ctaHref: d.ctaHref,
        imageDesktop: d.imageDesktop,
        imageMobile: d.imageMobile || undefined,
      }));
  } catch (err) {
    console.error('[cms] getActiveHeroSlides error', err);
    return [];
  }
}

export async function getActiveAnnouncements(): Promise<string[]> {
  try {
    await connectToDatabase();
    const docs = await Announcement.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    return (docs as any[])
      .filter((d) => withinWindow(d))
      .map((d) => d.message);
  } catch (err) {
    console.error('[cms] getActiveAnnouncements error', err);
    return [];
  }
}

export async function getFeaturedProductIds(): Promise<string[]> {
  try {
    await connectToDatabase();
    const doc = await Featured.findOne({ slot: 'home' }).lean();
    if (!doc) return [];
    const featured = doc as unknown as FeaturedDoc & {
      startsAt?: Date | null;
      endsAt?: Date | null;
    };
    if (!withinWindow(featured)) return [];
    return Array.isArray(featured.productIds) ? featured.productIds : [];
  } catch (err) {
    console.error('[cms] getFeaturedProductIds error', err);
    return [];
  }
}

// Re-export so callers can use the AnnouncementDoc type if needed.
export type { AnnouncementDoc };
