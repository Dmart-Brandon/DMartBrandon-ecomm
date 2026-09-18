import { Skeleton } from '@/components/ui/skeleton';
import {
  HeroSkeleton,
  GridSkeleton,
  RailSkeleton,
  CategoryCardsSkeleton,
} from '@/components/storefront/skeletons';

export default function HomeLoading() {
  return (
    <>
      <div className="hidden h-8 border-b border-border/60 bg-secondary/30 md:block" />
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="hidden h-10 flex-1 md:block" />
          <Skeleton className="ml-auto h-9 w-9" />
        </div>
      </div>
      <div className="border-b border-border/60">
        <div className="mx-auto flex h-11 max-w-[1440px] items-center gap-2 px-4 sm:px-6 lg:px-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
      </div>

      <HeroSkeleton />

      <main className="space-y-10 py-8">
        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </section>
        <GridSkeleton title="Featured for businesses" cols={6} count={6} />
        <CategoryCardsSkeleton />
        <RailSkeleton title="Top picks in Vegetables" />
        <RailSkeleton title="Fruits in season" />
      </main>
    </>
  );
}
