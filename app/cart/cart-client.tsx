'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBasket,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavbarClient as Navbar } from '@/components/storefront/navbar-client';
import { AnnouncementsBar } from '@/components/storefront/announcements-bar';
import { Footer } from '@/components/storefront/footer';
import { openBulkQuote } from '@/components/storefront/bulk-quote-sheet';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCart } from '@/lib/cart-context';
import { activeTier, nextTier } from '@/lib/types';

const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING = 99;

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function getItemAlert(item: {
  quantity: number;
  unit: string;
  moq?: number;
  price: number;
  originalPrice?: number;
  priceTiers?: { minQty: number; price: number }[];
}, liveStock: number | undefined) {
  const tier = activeTier(item.quantity, item.priceTiers);
  const upcoming = nextTier(item.quantity, item.priceTiers);
  const belowMoq = item.quantity < (item.moq ?? 1);
  const isOutOfStock = liveStock != null && liveStock <= 0;
  const stockLow =
    liveStock != null && liveStock > 0 && item.quantity >= liveStock;

  if (isOutOfStock) {
    return { tone: 'error' as const, text: 'Out of stock — remove to continue' };
  }
  if (belowMoq) {
    return {
      tone: 'error' as const,
      text: `Min order ${item.moq ?? 1} ${item.unit} — add ${(item.moq ?? 1) - item.quantity} more`,
    };
  }
  if (stockLow) {
    return {
      tone: 'warn' as const,
      text: `Only ${liveStock} ${item.unit} left`,
    };
  }
  if (!tier && upcoming) {
    return {
      tone: 'info' as const,
      text: `Add ${upcoming.minQty - item.quantity} more for ${formatINR(upcoming.price)}/${item.unit}`,
    };
  }
  if (tier) {
    const savings =
      ((item.originalPrice ?? item.price) - item.price) * item.quantity;
    if (savings > 0) {
      return {
        tone: 'success' as const,
        text: `Bulk tier unlocked — you save ${formatINR(savings)}`,
      };
    }
  }
  return null;
}

export function CartClient() {
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const {
    items,
    removeItem,
    updateQuantity,
    syncStock,
    itemCount,
    totalPrice,
    totalSavings,
  } = useCart();

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.productId).join(',');
    fetch(`/api/products?ids=${ids}`)
      .then((r) => r.json())
      .then((products: any[]) => {
        if (!Array.isArray(products)) return;
        const map: Record<string, number> = {};
        for (const p of products) {
          map[p.id] = p.stock ?? 0;
        }
        setStockMap(map);
        syncStock(map);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementsBar />
        <Navbar />
        <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-5 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <ShoppingBasket className="h-8 w-8" />
            </span>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Your cart is empty
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Reorder your last delivery in one tap, or browse today&apos;s bulk deals.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="lg">
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse products
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/orders">View past orders</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const shipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const grandTotal = totalPrice + shipping;
  const amountForFreeDelivery = FREE_SHIPPING_THRESHOLD - totalPrice;

  const hasBlockedCheckout = items.some((item) => {
    const liveStock = stockMap[item.productId];
    const alert = getItemAlert(item, liveStock);
    return alert?.tone === 'error';
  });

  return (
    <div className="bg-[#f7f8f8] lg:min-h-screen lg:bg-background">
      <AnnouncementsBar />
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-3 pb-36 pt-2 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        {/* Mobile header */}
        <div className="mb-2 flex items-center gap-2 lg:mb-4">
          <Link
            href="/products"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm lg:hidden"
            aria-label="Back to shop"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#318616] lg:text-[11px] lg:tracking-[0.18em]">
              Your basket
            </p>
            <h1 className="font-display text-base font-bold tracking-tight lg:text-3xl">
              <span className="lg:hidden">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <span className="hidden lg:inline">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} ready to go
              </span>
            </h1>
          </div>
          <Link
            href="/products"
            className="shrink-0 text-xs font-semibold text-[#318616] lg:hidden"
          >
            + Add
          </Link>
        </div>

        {totalPrice > 25000 && (
          <div className="mb-4 hidden flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 lg:mb-6 lg:flex">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm">
                <span className="font-semibold">Have a large order?</span>{' '}
                <span className="text-muted-foreground">
                  Cart over ₹25,000 may qualify for a custom quote with sharper
                  pricing.
                </span>
              </p>
            </div>
            <Button onClick={openBulkQuote} size="sm" className="gap-2">
              <FileText className="h-3.5 w-3.5" />
              Request a custom quote
            </Button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:gap-6">
          <div className="lg:space-y-3">
            <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:space-y-3 lg:bg-transparent lg:shadow-none">
              {items.map((item, index) => {
                const lineTotal = item.price * item.quantity;
                const liveStock = stockMap[item.productId];
                const isOutOfStock = liveStock != null && liveStock <= 0;
                const alert = getItemAlert(item, liveStock);

                return (
                  <div
                    key={item.productId}
                    className={`relative px-3 py-2.5 lg:rounded-xl lg:border lg:p-4 ${
                      index < items.length - 1
                        ? 'border-b border-black/[0.06] lg:border-b-0'
                        : ''
                    } ${
                      isOutOfStock
                        ? 'lg:border-destructive/40 lg:bg-destructive/5'
                        : 'lg:border-border/60 lg:bg-card'
                    }`}
                  >
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => setPendingRemove(item.productId)}
                      className="absolute right-2 top-2 rounded p-1 text-muted-foreground/70 hover:bg-secondary hover:text-rose-500 lg:hidden"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex gap-2.5 pr-6 lg:pr-0">
                      <Link
                        href={item.slug ? `/products/${item.slug}` : '/products'}
                        prefetch
                        className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5] lg:h-20 lg:w-20"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            className="object-cover object-center"
                            sizes="52px"
                          />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={item.slug ? `/products/${item.slug}` : '/products'}
                          className="line-clamp-2 pr-0 text-[13px] font-semibold leading-tight text-foreground lg:pr-8 lg:text-base"
                        >
                          {item.productName}
                        </Link>

                        <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                          {formatINR(item.price)}
                          <span className="text-muted-foreground/70">/{item.unit}</span>
                        </p>

                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center overflow-hidden rounded-xl border border-[#a8d39a] bg-[#eef8ea] tabular-nums">
                            <button
                              type="button"
                              aria-label="Decrease"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - (item.stepSize ?? 1)
                                )
                              }
                              disabled={
                                isOutOfStock || item.quantity <= (item.moq ?? 1)
                              }
                              className="flex h-[32px] w-[32px] items-center justify-center border-r border-[#b7ddb0] text-[#7ca16f] disabled:opacity-40"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[84px] px-2 text-center text-sm font-bold text-[#2f5b1f]">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + (item.stepSize ?? 1)
                                )
                              }
                              disabled={
                                isOutOfStock ||
                                (liveStock != null
                                  ? item.quantity >= liveStock
                                  : item.stock != null &&
                                    item.quantity >= item.stock)
                              }
                              className="flex h-[32px] w-[32px] items-center justify-center border-l border-[#b7ddb0] text-[#7ca16f] disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold tabular-nums">
                            {formatINR(lineTotal)}
                          </span>
                        </div>

                        {alert && (
                          <p
                            className={`mt-1 text-[10px] font-medium leading-snug lg:hidden ${
                              alert.tone === 'error'
                                ? 'text-destructive'
                                : alert.tone === 'warn'
                                  ? 'text-amber-800'
                                  : alert.tone === 'success'
                                    ? 'text-[#318616]'
                                    : 'text-muted-foreground'
                            }`}
                          >
                            {alert.text}
                          </p>
                        )}

                        <div className="mt-2 hidden space-y-1.5 lg:block">
                          {(() => {
                            const tier = activeTier(item.quantity, item.priceTiers);
                            const upcoming = nextTier(item.quantity, item.priceTiers);
                            const belowMoq = item.quantity < (item.moq ?? 1);
                            const stockLow =
                              liveStock != null &&
                              liveStock > 0 &&
                              item.quantity >= liveStock;
                            const savings = Math.max(
                              0,
                              ((item.originalPrice ?? item.price) - item.price) *
                                item.quantity
                            );
                            return (
                              <>
                                {tier && savings > 0 && (
                                  <p className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                                    <TrendingUp className="h-3 w-3" />
                                    Bulk tier — saved {formatINR(savings)}
                                  </p>
                                )}
                                {!tier && upcoming && (
                                  <p className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-secondary px-2 py-1 text-[11px] font-medium">
                                    <TrendingUp className="h-3 w-3" />
                                    Add {upcoming.minQty - item.quantity} more{' '}
                                    {item.unit} for {formatINR(upcoming.price)}/
                                    {item.unit}
                                  </p>
                                )}
                                {belowMoq && (
                                  <p className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    Min order {(item.moq ?? 1) - item.quantity}{' '}
                                    more {item.unit}
                                  </p>
                                )}
                                {isOutOfStock && (
                                  <p className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    Out of stock
                                  </p>
                                )}
                                {stockLow && !isOutOfStock && (
                                  <p className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800">
                                    <AlertCircle className="h-3 w-3" />
                                    Only {liveStock} {item.unit} left
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        <button
                          type="button"
                          aria-label="Remove"
                          onClick={() => setPendingRemove(item.productId)}
                          className="mt-2 hidden text-xs text-muted-foreground hover:text-rose-500 lg:inline-flex lg:items-center lg:gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile bill */}
            <div className="mt-2.5 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:hidden">
              <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-foreground/80">
                Bill details
              </h2>
              <dl className="space-y-1.5 text-[13px] tabular-nums">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Item total</dt>
                  <dd className="font-medium text-foreground">{formatINR(totalPrice)}</dd>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-[#318616]">
                    <dt>Savings</dt>
                    <dd>−{formatINR(totalSavings)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <dt>Delivery fee</dt>
                  <dd className="font-medium text-foreground">
                    {shipping === 0 ? (
                      <span className="text-[#318616]">FREE</span>
                    ) : (
                      formatINR(shipping)
                    )}
                  </dd>
                </div>
                <div className="my-1 border-t border-dashed border-black/10" />
                <div className="flex justify-between text-[15px] font-bold">
                  <dt>Grand total</dt>
                  <dd>{formatINR(grandTotal)}</dd>
                </div>
              </dl>
              {amountForFreeDelivery > 0 && (
                <p className="mt-2 rounded-md bg-[#fff8e1] px-2 py-1.5 text-center text-[10px] font-medium text-foreground/85">
                  Add {formatINR(amountForFreeDelivery)} more for free delivery
                </p>
              )}
              <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                GST invoice available at checkout
              </p>
            </div>

            <Link
              href="/products"
              className="mt-3 hidden items-center gap-1 text-sm font-medium text-primary lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border/60 bg-secondary/30 p-5">
              <h2 className="mb-4 font-display text-base font-semibold">
                Order summary
              </h2>

              <dl className="space-y-2 text-sm tabular-nums">
                <div className="flex justify-between text-muted-foreground">
                  <dt>
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </dt>
                  <dd>{formatINR(totalPrice)}</dd>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-primary">
                    <dt>Bulk discount</dt>
                    <dd>−{formatINR(totalSavings)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <dt>Shipping</dt>
                  <dd>{shipping === 0 ? 'Free' : formatINR(shipping)}</dd>
                </div>
                <div className="my-2 border-t" />
                <div className="flex justify-between text-base font-bold">
                  <dt>Total</dt>
                  <dd>{formatINR(grandTotal)}</dd>
                </div>
              </dl>

              {amountForFreeDelivery > 0 && (
                <p className="mt-2 rounded-md border border-primary/30 bg-secondary px-2 py-1.5 text-[11px] text-secondary-foreground">
                  Add {formatINR(amountForFreeDelivery)} more for free delivery
                </p>
              )}

              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Need a GST invoice? Add your GSTIN at checkout.
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified suppliers · Secure checkout
              </p>

              {hasBlockedCheckout ? (
                <Button size="lg" className="mt-5 w-full" disabled>
                  Remove out-of-stock items to proceed
                </Button>
              ) : (
                <Button asChild size="lg" className="mt-5 w-full">
                  <Link href="/checkout">Proceed to checkout</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky checkout */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_20px_rgba(0,0,0,0.1)] lg:hidden">
        {amountForFreeDelivery > 0 && (
          <p className="mb-1.5 text-center text-[10px] font-medium text-muted-foreground">
            Add {formatINR(amountForFreeDelivery)} more for free delivery
          </p>
        )}
        <div className="mb-2 flex items-center justify-between tabular-nums">
          <span className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
            {shipping > 0 ? ` · +${formatINR(shipping)} delivery` : ' · FREE delivery'}
          </span>
          <span className="text-lg font-bold">{formatINR(grandTotal)}</span>
        </div>
        {hasBlockedCheckout ? (
          <Button size="lg" className="h-11 w-full rounded-lg" disabled>
            Fix items to continue
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-lg bg-[#318616] text-[15px] font-bold hover:bg-[#2a7012]"
          >
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
        )}
      </div>

      <div className="hidden lg:block">
        <Footer />
      </div>

      <AlertDialog open={pendingRemove !== null} onOpenChange={(open) => { if (!open) setPendingRemove(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be removed from your cart. You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (pendingRemove) removeItem(pendingRemove); setPendingRemove(null); }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
