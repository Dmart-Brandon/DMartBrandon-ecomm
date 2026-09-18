import { Skeleton } from '@/components/ui/skeleton';

interface GridProps {
  title?: string;
  cols?: number;
  count?: number;
}

export function CardSkeleton() {
  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border/50 bg-card lg:hidden">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="space-y-1.5 p-2">
          <Skeleton className="h-2.5 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3.5 w-14" />
        </div>
      </div>
      <div className="hidden h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card lg:flex">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="space-y-2 p-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      </div>
    </>
  );
}

export function GridSkeleton({ title, cols = 6, count = 6 }: GridProps) {
  void cols;
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      {title && <Skeleton className="mb-5 h-7 w-48" />}
      <div className="product-grid">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function RailSkeleton({ title }: { title?: string }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      {title && <Skeleton className="mb-5 h-7 w-56" />}
      <div className="-mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid grid-flow-col auto-cols-[60%] gap-3 sm:auto-cols-[33%] md:auto-cols-[25%] lg:auto-cols-[20%] xl:auto-cols-[16.66%]">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryCardsSkeleton() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <Skeleton className="mb-5 h-7 w-64" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border/60 bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <div className="aspect-[16/7] w-full bg-secondary/40 sm:aspect-[16/6] md:aspect-[16/5]">
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
}
