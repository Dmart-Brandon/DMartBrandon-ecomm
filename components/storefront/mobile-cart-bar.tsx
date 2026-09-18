'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export function MobileCartBar() {
  const { itemCount, totalPrice } = useCart();
  const pathname = usePathname();

  if (itemCount === 0) return null;
  if (pathname === '/cart' || pathname.startsWith('/checkout')) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-3 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
      <Link
        href="/cart"
        className="flex h-12 items-center justify-between rounded-xl bg-primary px-4 text-primary-foreground"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <ShoppingCart className="h-4 w-4" />
          {itemCount} {itemCount === 1 ? 'item' : 'items'} · ₹
          {totalPrice.toLocaleString('en-IN')}
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold">
          Checkout
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}
