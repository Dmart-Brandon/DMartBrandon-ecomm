'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';

type Item = {
  productId: string;
  productName: string;
  image: string;
  unit: string;
  price: number;
  lastQty: number;
};

export function ReorderTile({ item }: { item: Item }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(item.lastQty || 1);
  const [added, setAdded] = useState(false);

  function add() {
    addItem({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      originalPrice: item.price,
      image: item.image,
      quantity: qty,
      unit: item.unit,
      moq: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
          {item.image && (
            <Image
              src={item.image}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold">{item.productName}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            ₹{item.price}/{item.unit} · last ordered {item.lastQty} {item.unit}
            {item.lastQty > 1 && !item.unit.endsWith('s') ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center rounded-md border border-border tabular-nums">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Decrease"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-secondary"
            aria-label="Increase"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <Button
          size="sm"
          onClick={add}
          variant={added ? 'outline' : 'default'}
          className={`h-8 flex-1 text-xs ${added ? 'border-emerald-500 text-emerald-700' : ''}`}
        >
          <Repeat className="mr-1 h-3 w-3" />
          {added ? 'Added again' : 'Add again'}
        </Button>
      </div>
    </div>
  );
}
