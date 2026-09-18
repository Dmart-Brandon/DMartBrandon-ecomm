'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Pencil,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart-context';
import type { SavedList } from '@/lib/types';

interface Props {
  listId: string;
}

export function SavedListDetailClient({ listId }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const [list, setList] = useState<SavedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingQty, setSavingQty] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/saved-lists/${listId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setList(data as SavedList);
        setNewName(data.name);
      })
      .catch(() => toast.error('Failed to load list'))
      .finally(() => setLoading(false));
  }, [listId]);

  async function rename() {
    if (!list) return;
    const name = newName.trim();
    if (!name || name === list.name) {
      setRenaming(false);
      setNewName(list.name);
      return;
    }
    try {
      const res = await fetch(`/api/saved-lists/${list.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as SavedList;
      setList(updated);
      setRenaming(false);
      toast.success('List renamed');
    } catch {
      toast.error('Failed to rename list');
    }
  }

  async function updateQty(productId: string, qty: number) {
    if (!list) return;
    setSavingQty(productId);
    try {
      const res = await fetch(
        `/api/saved-lists/${list.id}/items/${productId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty }),
        }
      );
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as SavedList;
      setList(updated);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setSavingQty(null);
    }
  }

  async function removeItem(productId: string) {
    if (!list) return;
    try {
      const res = await fetch(
        `/api/saved-lists/${list.id}/items/${productId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as SavedList;
      setList(updated);
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove item');
    }
  }

  function addAllToCart() {
    if (!list || list.items.length === 0) {
      toast.error('Nothing to add');
      return;
    }
    let added = 0;
    for (const item of list.items) {
      addItem({
        productId: item.productId,
        productName: item.productName,
        slug: item.slug,
        price: item.price,
        originalPrice: item.price,
        image: item.image,
        quantity: item.qty,
        unit: item.unit,
        moq: 1,
      });
      added += 1;
    }
    toast.success(`Added ${added} item${added === 1 ? '' : 's'} to cart`);
    router.push('/cart');
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-secondary/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">List not found</h1>
        <Button asChild className="mt-4">
          <Link href="/account/saved-lists">Back to lists</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/account/saved-lists"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        All lists
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={60}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    rename();
                  } else if (e.key === 'Escape') {
                    setRenaming(false);
                    setNewName(list.name);
                  }
                }}
                className="text-lg font-bold"
              />
              <Button size="sm" onClick={rename} className="gap-1">
                <Check className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {list.name}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRenaming(true)}
                aria-label="Rename list"
                className="text-muted-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {list.items.length} item{list.items.length === 1 ? '' : 's'}
          </p>
        </div>
        {list.items.length > 0 && (
          <Button onClick={addAllToCart} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Add all to cart
          </Button>
        )}
      </div>

      {list.items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-secondary/40 p-10 text-center">
          <p className="text-sm font-medium">This list is empty</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap the bookmark icon on any product to save it here.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="block truncate text-sm font-medium hover:text-primary"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-muted-foreground tabular-nums">
                  ₹{item.price.toLocaleString('en-IN')}/{item.unit}
                </p>
              </div>
              <div className="flex items-center rounded-md border border-border tabular-nums">
                <button
                  type="button"
                  aria-label="Decrease"
                  onClick={() =>
                    updateQty(item.productId, Math.max(1, item.qty - 1))
                  }
                  disabled={savingQty === item.productId || item.qty <= 1}
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold">
                  {item.qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase"
                  onClick={() => updateQty(item.productId, item.qty + 1)}
                  disabled={savingQty === item.productId}
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.productId)}
                aria-label="Remove item"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
