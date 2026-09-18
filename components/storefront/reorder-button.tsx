'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';
import type { OrderItem, EcommProduct } from '@/lib/types';

interface Props {
  items: OrderItem[];
  variant?: 'primary' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ReorderButton({
  items,
  variant = 'outline',
  size = 'default',
  className,
}: Props) {
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function reorder() {
    if (items.length === 0) {
      toast.error('Nothing to reorder');
      return;
    }
    setBusy(true);
    try {
      const ids = Array.from(new Set(items.map((i) => i.productId).filter(Boolean)));
      // Fetch live products to validate stock + names + price tiers.
      const res = await fetch(`/api/products?ids=${ids.join(',')}`);
      const products: EcommProduct[] = res.ok ? await res.json() : [];
      const byId = new Map<string, EcommProduct>();
      for (const p of products) byId.set(p.id, p);

      let added = 0;
      let outOfStock = 0;
      let stockReduced = 0;
      let missing = 0;

      // Drop the existing cart so this reorder is the new working set.
      clearCart();

      for (const item of items) {
        const live = byId.get(item.productId);
        if (!live) {
          missing += 1;
          continue;
        }
        if (live.stock <= 0) {
          outOfStock += 1;
          continue;
        }
        const requestedQty = item.quantity;
        const cappedQty = Math.min(requestedQty, live.stock);
        if (cappedQty < requestedQty) stockReduced += 1;
        addItem({
          productId: live.id,
          productName: live.name,
          slug: live.slug,
          price: live.price,
          originalPrice: live.price,
          priceTiers: live.priceTiers,
          image: live.images[0] ?? '',
          quantity: cappedQty,
          unit: live.unit,
          moq: live.moq,
          stepSize: live.stepSize,
          packSize: live.packSize,
          hsnCode: live.hsnCode,
          categoryName: live.categoryName,
        });
        added += 1;
      }

      if (added === 0) {
        toast.error('Items from this order are no longer available.');
      } else {
        const parts: string[] = [`${added} item${added === 1 ? '' : 's'} added`];
        if (stockReduced > 0)
          parts.push(`${stockReduced} reduced to available stock`);
        if (outOfStock > 0) parts.push(`${outOfStock} out of stock`);
        if (missing > 0) parts.push(`${missing} no longer sold`);
        toast.success(parts.join(' · '));
        startTransition(() => router.push('/cart'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? 'Reorder failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      onClick={reorder}
      disabled={busy || pending}
      variant={variant === 'primary' ? 'default' : 'outline'}
      size={size}
      className={`gap-2 ${className ?? ''}`}
    >
      <Repeat className="h-4 w-4" />
      {busy || pending ? 'Reordering…' : 'Reorder'}
    </Button>
  );
}
