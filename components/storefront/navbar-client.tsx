'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Menu, ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SearchBox } from './search-box';
import { CartIcon } from './cart-icon';
import { AccountMenu } from './account-menu';
import { openBulkQuote } from './bulk-quote-sheet';
import { useCart } from '@/lib/cart-context';

const STATIC_LINKS = [
  { href: '/products', label: 'All products' },
  { href: '/products?featured=true', label: 'Featured' },
];

const BOTTOM_LINKS = [
  { href: '/orders', label: 'My Orders' },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

export function NavbarClient({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const isDesktop = useIsDesktop();
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  return (
    <nav
      className={`border-b border-border/60 bg-[#fffdf5]/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:sticky lg:top-0 lg:z-40 lg:border-border/50 lg:bg-white/95 lg:shadow-none ${className ?? ''}`}
    >
      <div className="mx-auto flex h-11 max-w-[1440px] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:h-[4.25rem] lg:gap-5 lg:px-8">
        {/* Logo — desktop; mobile uses compact bar above store header */}
        <Link
          href="/"
          className="hidden shrink-0 items-center gap-2 lg:flex lg:min-w-[124px]"
          aria-label="DMartBrandon home"
        >
          <Image
            src="/DMartBrandon_logo.png"
            alt="DMartBrandon"
            width={160}
            height={64}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <Link
          href="/"
          className="flex shrink-0 items-center lg:hidden"
          aria-label="DMartBrandon home"
        >
          <Image
            src="/DMartBrandon_logo.png"
            alt="DMartBrandon"
            width={120}
            height={48}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Search (desktop) */}
        <div className="hidden flex-1 md:block lg:max-w-[760px]">
          <div className="rounded-lg border border-border/70 bg-white">
            <SearchBox />
          </div>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1 md:gap-2 lg:gap-3">
          <button
            type="button"
            onClick={openBulkQuote}
            className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-secondary lg:inline-flex"
          >
            <FileText className="h-3.5 w-3.5" />
            Bulk Quote
          </button>
          {isDesktop && <AccountMenu />}
          <CartIcon />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto sm:max-w-sm">
              <div className="flex max-h-[100dvh] flex-col gap-1 py-6 pr-1">
                <div className="mb-3">
                  <SearchBox />
                </div>
                {STATIC_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {c.name}
                  </Link>
                ))}
                {BOTTOM_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground tabular-nums">
                    {itemCount}
                  </span>
                </Link>
                {open && !isDesktop && (
                  <div className="mt-2 border-t border-border pt-3">
                    <AccountMenu />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
