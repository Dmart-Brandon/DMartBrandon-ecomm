import { Suspense } from 'react';
import { Navbar } from '@/components/storefront/navbar';
import { HeroCarousel } from '@/components/storefront/hero-carousel';
import { CategoryCards } from '@/components/storefront/category-cards';
import { CategoryRail } from '@/components/storefront/category-rail';
import { TrustStrip } from '@/components/storefront/trust-strip';
import { Footer } from '@/components/storefront/footer';
import {
  RailSkeleton,
  CategoryCardsSkeleton,
} from '@/components/storefront/skeletons';
import { getActiveHeroSlides } from '@/lib/cms';

// Page is dynamic because cookies (pincode) are read inside.
// Each fetch already has its own short revalidate window via the CMS helpers.
export const revalidate = 60;

export default async function HomePage() {
  const cmsSlides = await getActiveHeroSlides();

  return (
    <>
      <Navbar />

      <div className="max-lg:px-3 max-lg:pt-2 lg:mx-auto lg:max-w-[1440px] lg:px-8 lg:pt-4">
        {cmsSlides.length > 0 && <HeroCarousel slides={cmsSlides} />}
      </div>

      <main className="space-y-6 py-4 lg:mx-auto lg:max-w-[1440px] lg:space-y-9 lg:py-8 lg:px-8">
        <Suspense fallback={<CategoryCardsSkeleton />}>
          <div className="max-lg:-mt-2">
            <CategoryCards />
          </div>
        </Suspense>

        <Suspense fallback={<RailSkeleton title="Top picks in Vegetables" />}>
          <CategoryRail
            categorySlug="vegetables"
            title="Fresh today — Vegetables"
            eyebrow="Top picks"
          />
        </Suspense>
        <Suspense fallback={<RailSkeleton title="Fruits in season" />}>
          <CategoryRail
            categorySlug="fruits"
            title="Fruits in season"
            eyebrow="Hand-picked"
          />
        </Suspense>
      </main>

      <TrustStrip />
      <Footer />
    </>
  );
}
