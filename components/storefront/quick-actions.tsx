import Link from 'next/link';
import { ArrowRight, Repeat, Tag, Truck, FileText } from 'lucide-react';

const TILES = [
  {
    title: 'Reorder your last order',
    body: 'One-tap restock from your past delivery',
    href: '/orders',
    icon: Repeat,
  },
  {
    title: "Today's bulk deals",
    body: 'Sharper prices on volume orders',
    href: '/products?featured=true',
    icon: Tag,
  },
  {
    title: 'Same-day delivery',
    body: 'Order fresh produce by 8 PM',
    href: '/products?category=vegetables',
    icon: Truck,
  },
  {
    title: 'Request a quote',
    body: 'For orders above ₹25,000',
    href: '#',
    icon: FileText,
  },
];

export function QuickActions() {
  return (
    <section
      aria-label="Desktop promotions"
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:hidden">
        {TILES.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            prefetch
            className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-4"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <t.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {t.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {t.body}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4">
        <Link
          href="/products?featured=true"
          className="group relative col-span-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-500 p-6 text-white shadow-[0_20px_45px_-28px_rgba(16,185,129,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_rgba(16,185,129,0.9)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">Today on DMartBrandon</p>
          <h3 className="mt-2 font-display text-3xl font-bold leading-tight">
            Stock up on daily essentials
          </h3>
          <p className="mt-2 max-w-md text-sm text-white/90">
            Fresh vegetables, fruits, dairy and staples with business-friendly prices.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-emerald-700">
            Shop now
            <ArrowRight className="h-4 w-4" />
          </span>
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 left-8 h-28 w-28 rounded-full bg-lime-200/20 blur-2xl" />
        </Link>

        <div className="col-span-7 grid grid-cols-3 gap-4">
          {TILES.slice(1).map((t) => (
            <Link
              key={t.title}
              href={t.href}
              prefetch
              className="group rounded-2xl border border-border/70 bg-white p-4 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.9)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_34px_-20px_rgba(16,185,129,0.35)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <t.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[15px] font-semibold leading-tight text-foreground">{t.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
            </Link>
          ))}
          <Link
            href="/orders"
            prefetch
            className="group rounded-2xl border border-border/70 bg-[#f7faf7] p-4 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.9)] transition-all hover:-translate-y-0.5 hover:border-primary/35"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Repeat className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[15px] font-semibold leading-tight text-foreground">Reorder in one click</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Repeat your last order quickly with saved cart quantities.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
