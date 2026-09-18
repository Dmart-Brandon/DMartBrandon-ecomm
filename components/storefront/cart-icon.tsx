'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';

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

export function CartIcon() {
  const { items, itemCount, totalPrice } = useCart();
  const isDesktop = useIsDesktop();
  const last3 = items.slice(-3).reverse();

  const link = (
    <Link
      href="/cart"
      prefetch
      aria-label={`Cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      {itemCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums md:-right-1 md:-top-1 md:h-5 md:min-w-[1.25rem] md:text-[11px]"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );

  if (itemCount === 0 || !isDesktop) {
    return link;
  }

  return (
    <HoverCard openDelay={120} closeDelay={120}>
      <HoverCardTrigger asChild>{link}</HoverCardTrigger>
      <HoverCardContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            In your cart
          </p>
          <p className="font-display text-lg font-bold tabular-nums">
            ₹{totalPrice.toLocaleString('en-IN')}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </p>
        </div>
        <ul className="max-h-72 divide-y divide-border overflow-auto">
          {last3.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 px-4 py-2.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {items.length > 3 && (
          <p className="px-4 py-2 text-center text-xs text-muted-foreground">
            +{items.length - 3} more in cart
          </p>
        )}
        <div className="border-t border-border p-3">
          <Button asChild className="w-full" size="sm">
            <Link href="/cart">View cart &amp; checkout</Link>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
