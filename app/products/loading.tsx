import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from '@/components/storefront/skeletons';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden h-8 border-b border-border/60 bg-secondary/30 md:block" />
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="hidden h-10 flex-1 md:block" />
          <Skeleton className="ml-auto h-9 w-9" />
        </div>
      </div>
      <div className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-72" />
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="hidden space-y-4 lg:block">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </aside>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
