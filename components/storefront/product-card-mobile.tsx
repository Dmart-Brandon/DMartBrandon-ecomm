'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Minus, Plus } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { type EcommProduct, activeTier } from '@/lib/types';
import { cn } from '@/lib/utils';

const MOBILE_CARD_SIZES = '(max-width: 1023px) 33vw';

function formatPrice(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

interface ProductCardMobileProps {
  product: EcommProduct;
}

export function ProductCardMobile({ product }: ProductCardMobileProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const moq = Math.max(1, product.moq || 1);
  const stepSize = Math.max(1, product.stepSize || 1);
  const [pending, startTransition] = useTransition();

  const cartLine = items.find((i) => i.productId === product.id);
  const qty = cartLine?.quantity ?? 0;

  const tier = activeTier(qty || moq, product.priceTiers);
  const unitPrice = tier ? tier.price : product.price;
  const hasDiscount =
    !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  const packLabel =
    product.packSize?.label ||
    `${product.unit}${moq > 1 ? ` · min ${moq}` : ''}`;

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      price: unitPrice,
      originalPrice: product.price,
      priceTiers: product.priceTiers,
      image: product.images[0] || '',
      quantity: moq,
      stock: product.stock,
      unit: product.unit,
      moq,
      stepSize,
      packSize: product.packSize,
      hsnCode: product.hsnCode,
      categoryName: product.categoryName,
    });
  }

  function changeQty(delta: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!cartLine) return;
    const next = qty + delta;
    if (next < moq) {
      removeItem(product.id);
      return;
    }
    if (product.stock > 0 && next > product.stock) return;
    updateQuantity(product.id, next);
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm">
      <Link
        href={`/products/${product.slug}`}
        prefetch
        className="relative block aspect-square overflow-hidden bg-white"
        aria-label={product.name}
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            loading="lazy"
            className="object-cover object-center"
            sizes={MOBILE_CARD_SIZES}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Leaf className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-1.5 top-1.5 rounded bg-[#256fef] px-1 py-0.5 text-[9px] font-bold text-white">
            {discountPct}% OFF
          </span>
        )}

        <div className="absolute bottom-1.5 right-1.5 z-10">
          {qty > 0 ? (
            <div
              className="flex items-center overflow-hidden rounded-md border-2 border-[#318616] bg-[#318616] text-white shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                className="flex h-7 w-7 items-center justify-center"
                onClick={(e) => changeQty(-stepSize, e)}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[1.25rem] text-center text-xs font-bold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="flex h-7 w-7 items-center justify-center disabled:opacity-50"
                disabled={product.stock > 0 && qty >= product.stock}
                onClick={(e) => changeQty(stepSize, e)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={pending || product.stock <= 0}
              onClick={addToCart}
              className={cn(
                'rounded-md border-2 border-[#318616] bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#318616] shadow-sm transition-transform active:scale-95',
                product.stock <= 0 && 'border-muted-foreground text-muted-foreground'
              )}
            >
              {product.stock <= 0 ? 'OUT' : 'ADD'}
            </button>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-0.5 px-2 pb-2 pt-1.5">
        <p className="text-[10px] font-medium text-muted-foreground line-clamp-1">
          {packLabel}
        </p>
        <Link
          href={`/products/${product.slug}`}
          prefetch
          className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground"
          title={product.name}
        >
          {product.name}
        </Link>
        <div className="mt-auto flex flex-wrap items-baseline gap-1 pt-0.5 tabular-nums">
          <span className="text-xs font-bold text-foreground">
            {formatPrice(unitPrice)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        {moq > 1 && (
          <p className="text-[10px] font-medium text-muted-foreground">
            Min order: {moq}
          </p>
        )}
      </div>
    </article>
  );
}
