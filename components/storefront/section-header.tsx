import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View all',
}: Props) {
  return (
    <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:mb-5 sm:flex-row sm:items-end lg:mb-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary lg:text-[11px]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 font-display text-base font-bold tracking-tight sm:text-xl md:text-2xl lg:text-[1.35rem] lg:leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground lg:text-sm">{subtitle}</p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          prefetch
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline lg:text-sm"
        >
          {viewAllLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
