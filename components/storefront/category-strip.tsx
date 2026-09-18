import Link from 'next/link';
import { MegaMenuTrigger } from './mega-menu';

const PILLS = [
  { label: 'Vegetables', slug: 'vegetables' },
  { label: 'Fruits', slug: 'fruits' },
  { label: 'Dairy', slug: 'dairy' },
  { label: 'Cakes & Bakery', slug: 'cakes-bakery' },
  { label: 'Electronics', slug: 'electronics' },
];

const RIGHT_PILLS = [
  { label: "Today's Deals", href: '/products?featured=true' },
  { label: 'New Arrivals', href: '/products?newArrival=true' },
  { label: 'Bulk Pricing', href: '/products' },
];

export function CategoryStrip() {
  return (
    <div className="sticky top-16 z-30 border-b border-border/60 bg-background">
      <div className="mx-auto flex h-11 max-w-[1440px] items-center gap-1 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8">
        <MegaMenuTrigger />
        {PILLS.map((p) => (
          <Link
            key={p.slug}
            href={`/products?category=${p.slug}`}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
          >
            {p.label}
          </Link>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-border lg:inline-block" />
        {RIGHT_PILLS.map((p) => (
          <Link
            key={p.label}
            href={p.href}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
