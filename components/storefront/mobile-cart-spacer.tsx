'use client';

import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

/**
 * Reserves space at the bottom of the page on mobile so the fixed
 * <MobileCartBar /> doesn't cover footer links / page content.
 * Mirrors the visibility rules of MobileCartBar exactly.
 */
export function MobileCartSpacer() {
  const { itemCount } = useCart();
  const pathname = usePathname();

  if (itemCount === 0) return null;
  if (pathname === '/cart' || pathname.startsWith('/checkout')) return null;

  return <div aria-hidden className="h-20 md:hidden" />;
}
