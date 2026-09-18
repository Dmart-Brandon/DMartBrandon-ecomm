'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Leaf,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Info,
  Snowflake,
  Truck,
  Clock,
  Award,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCart } from '@/lib/cart-context';
import {
  type EcommProduct,
  type CategoryVariant,
  categoryVariantOf,
  activeTier,
  nextTier,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { SaveToListButton } from './save-to-list-button';
import { ProductCardMobile } from './product-card-mobile';

interface ProductCardProps {
  product: EcommProduct;
  variant?: CategoryVariant;
  etaLabel?: string;
  /**
   * `next/image` `sizes` hint. Default targets the homepage 6-col grid.
   * Pass a custom value when the card is rendered in a denser/looser context
   * (rails, PLP filter sidebar, etc.) so the browser fetches the right
   * resolution instead of always assuming 25vw.
   */
  sizes?: string;
}

const DEFAULT_CARD_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw';

function formatPrice(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function ProductCard({
  product,
  variant,
  etaLabel,
  sizes = DEFAULT_CARD_SIZES,
}: ProductCardProps) {
  const v: CategoryVariant =
    variant ?? categoryVariantOf(product.categoryName, product.categorySlug);
  const { addItem } = useCart();
  const moq = Math.max(1, product.moq || 1);
  const stepSize = Math.max(1, product.stepSize || 1);
  const [qty, setQty] = useState<number>(moq);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2400);
    return () => clearTimeout(t);
  }, [added]);

  const tier = activeTier(qty, product.priceTiers);
  const upcoming = nextTier(qty, product.priceTiers);
  const unitPrice = tier ? tier.price : product.price;
  const hasDiscount =
    !!product.compareAtPrice && product.compareAtPrice > product.price;

  const ribbon = (() => {
    // Avoid showing "Pre-order" for fresh categories like bakery/cakes.
    if (
      product.leadTimeHours &&
      product.leadTimeHours >= 24 &&
      v !== 'cake' &&
      v !== 'vegetable' &&
      v !== 'fruit' &&
      v !== 'dairy'
    ) {
      return 'Pre-order';
    }
    if (v === 'vegetable' || v === 'fruit' || v === 'dairy' || v === 'cake')
      return 'Fresh today';
    if (product.stock <= 0) return 'Out of stock';
    if (product.stock < 20) return `Only ${product.stock} left`;
    return 'In stock';
  })();

  function bumpQty(delta: number) {
    setQty((q) => {
      const next = q + delta;
      if (next < moq) return moq;
      if (product.stock > 0 && next > product.stock) return product.stock;
      return next;
    });
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const finalQty = Math.max(moq, qty);
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      price: unitPrice,
      originalPrice: product.price,
      priceTiers: product.priceTiers,
      image: product.images[0] || '',
      quantity: finalQty,
      stock: product.stock,
      unit: product.unit,
      moq,
      stepSize,
      packSize: product.packSize,
      hsnCode: product.hsnCode,
      categoryName: product.categoryName,
    });
    startTransition(() => {
      setAdded(true);
    });
  }

  const variantBadges: { icon: React.ReactNode; label: string }[] = [];
  if (v === 'vegetable' || v === 'fruit') {
    if (product.grade) variantBadges.push({ icon: <Award className="h-3 w-3" />, label: product.grade });
    if (product.origin) variantBadges.push({ icon: <MapPin className="h-3 w-3" />, label: product.origin });
  }
  if (v === 'dairy') {
    variantBadges.push({ icon: <Snowflake className="h-3 w-3" />, label: 'Refrigerated' });
    if (product.shelfLifeDays)
      variantBadges.push({ icon: <Clock className="h-3 w-3" />, label: `${product.shelfLifeDays}-day shelf` });
  }
  if (v === 'cake' && product.leadTimeHours) {
    variantBadges.push({
      icon: <Clock className="h-3 w-3" />,
      label: `${product.leadTimeHours}-hr advance`,
    });
  }
  if (v === 'electronics') {
    if (product.warrantyMonths)
      variantBadges.push({
        icon: <ShieldCheck className="h-3 w-3" />,
        label: `${product.warrantyMonths}-mo warranty`,
      });
    if (product.brand)
      variantBadges.push({ icon: <Award className="h-3 w-3" />, label: product.brand });
  }

  const ribbonClass = cn(
    'absolute left-2 top-2 z-10 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px] sm:gap-1',
    ribbon === 'Pre-order' && 'bg-foreground text-background',
    ribbon === 'Fresh today' && 'bg-primary text-primary-foreground',
    ribbon === 'In stock' && 'bg-white text-primary',
    ribbon === 'Out of stock' && 'bg-muted text-muted-foreground',
    ribbon.startsWith('Only') && 'bg-destructive text-destructive-foreground'
  );

  return (
    <>
      <div className="h-full lg:hidden">
        <ProductCardMobile product={product} />
      </div>
      <article className="group relative hidden h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-white transition-all hover:border-primary/35 hover:shadow-[0_10px_24px_-18px_rgba(16,185,129,0.35)] lg:flex lg:rounded-xl">
      <Link
        href={`/products/${product.slug}`}
        prefetch
        className="relative block aspect-square overflow-hidden bg-[#f7faf8]"
        aria-label={product.name}
      >
        {product.images[0] ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              loading="lazy"
              className={cn(
                'object-cover transition-opacity duration-300',
                product.secondaryImage && 'group-hover:opacity-0'
              )}
              sizes={sizes}
            />
            {product.secondaryImage && (
              <Image
                src={product.secondaryImage}
                alt=""
                fill
                loading="lazy"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                sizes={sizes}
                aria-hidden
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Leaf className="h-10 w-10 opacity-30" />
          </div>
        )}

        <span className={`lg:hidden ${ribbonClass}`}>{ribbon}</span>

        {hasDiscount && (
          <Badge className="absolute left-0 top-0 z-10 rounded-none rounded-br-md bg-[#3b82f6] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#3b82f6]">
            {Math.round(
              ((product.compareAtPrice! - product.price) /
                product.compareAtPrice!) *
                100
            )}
            % OFF
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 lg:gap-1 lg:p-2.5">
        {product.categoryName && (
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground lg:hidden">
            {product.categoryName}
          </p>
        )}
        <Link
          href={`/products/${product.slug}`}
          prefetch
          className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary lg:min-h-[2.1rem] lg:text-[12px] lg:leading-[1.25]"
          title={product.name}
        >
          {product.name}
        </Link>

        {product.packSize?.label && (
          <p className="text-xs font-semibold text-muted-foreground lg:text-[10px] lg:font-medium">
            {product.packSize.label}
          </p>
        )}

        {variantBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 lg:hidden">
            {variantBadges.slice(0, 1).map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground/80 lg:text-[9px]"
              >
                {b.icon}
                {b.label}
              </span>
            ))}
          </div>
        )}

        {v === 'electronics' && product.keySpec && (
          <p className="line-clamp-1 text-xs text-muted-foreground lg:hidden">
            {product.keySpec}
          </p>
        )}

        <div className="mt-1 flex items-end justify-between gap-2 tabular-nums lg:mt-0.5">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
          <span className="font-display text-base font-bold text-foreground sm:text-lg lg:text-[16px]">
            {formatPrice(unitPrice)}
            <span className="ml-0.5 text-xs font-medium text-muted-foreground lg:text-[10px]">
              /{product.unit}
            </span>
          </span>
          {hasDiscount && !tier && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
          {tier && product.price > tier.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
          </div>
          {moq > 1 && (
            <span className="text-[10px] font-medium text-muted-foreground lg:text-[10px]">
              Min order: {moq}
            </span>
          )}
        </div>

        {product.priceTiers && product.priceTiers.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/15 lg:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Info className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {upcoming
                    ? `Buy ${upcoming.minQty}+ at ${formatPrice(upcoming.price)}/${product.unit}`
                    : `Best price: ${formatPrice(unitPrice)}/${product.unit}`}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <p className="text-xs font-semibold text-foreground">
                Bulk pricing
              </p>
              <p className="text-[11px] text-muted-foreground">
                Save more as quantity increases
              </p>
              <table className="mt-2 w-full text-xs tabular-nums">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-1 font-medium">Quantity</th>
                    <th className="py-1 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={cn(!tier && 'font-semibold text-foreground')}>
                    <td className="py-1">
                      {moq > 1 ? `${moq}-` : '1-'}
                      {(product.priceTiers[0]?.minQty ?? 0) - 1 || '∞'}{' '}
                      {product.unit}
                    </td>
                    <td className="py-1">{formatPrice(product.price)}</td>
                  </tr>
                  {product.priceTiers
                    .slice()
                    .sort((a, b) => a.minQty - b.minQty)
                    .map((t, i, arr) => {
                      const upper = arr[i + 1]?.minQty;
                      const isActive = tier?.minQty === t.minQty;
                      return (
                        <tr
                          key={t.minQty}
                          className={cn(isActive && 'font-semibold text-primary')}
                        >
                          <td className="py-1">
                            {t.minQty}
                            {upper ? `–${upper - 1}` : '+'} {product.unit}
                          </td>
                          <td className="py-1">{formatPrice(t.price)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </PopoverContent>
          </Popover>
        )}

        <div className="mt-auto flex flex-row items-center gap-1.5 pt-2 lg:pt-2">
          <div className="flex shrink-0 items-center rounded-md border border-border bg-background tabular-nums lg:h-8">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => bumpQty(-stepSize)}
              disabled={qty <= moq}
              className="flex h-7 w-6 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 lg:h-8"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={qty}
              min={moq}
              max={product.stock > 0 ? product.stock : undefined}
              step={stepSize}
              onChange={(e) => {
                const next = parseInt(e.target.value, 10);
                if (Number.isNaN(next)) {
                  setQty(moq);
                  return;
                }
                if (next < moq) {
                  setQty(moq);
                  return;
                }
                if (product.stock > 0 && next > product.stock) {
                  setQty(product.stock);
                  return;
                }
                setQty(next);
              }}
              onClick={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLInputElement).select();
              }}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Quantity"
              className="h-7 w-8 border-0 bg-transparent text-center text-xs font-semibold tabular-nums outline-none focus:ring-2 focus:ring-primary/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none lg:h-8"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => bumpQty(stepSize)}
              disabled={product.stock > 0 && qty >= product.stock}
              className="flex h-7 w-6 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 lg:h-8"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          {added ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 min-w-0 flex-1 border-primary px-2 text-xs font-semibold text-primary lg:h-8"
            >
              <Link
                href="/cart"
                prefetch
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1"
              >
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Added</span>
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={pending || product.stock <= 0}
              className="h-7 min-w-0 flex-1 px-2 text-xs font-semibold transition-all lg:h-8 lg:rounded-md lg:border lg:border-primary/80 lg:bg-primary/10 lg:text-[11px] lg:text-primary lg:hover:bg-primary/15"
            >
              {product.stock <= 0 ? (
                <span className="truncate text-[10px]">Sold out</span>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5 shrink-0 lg:hidden" />
                  <span className="ml-1 hidden sm:inline lg:inline">ADD</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1.5 text-[10px]">
          <div className="ml-auto">
            <SaveToListButton product={product} />
          </div>
        </div>
      </div>
    </article>
    </>
  );
}
