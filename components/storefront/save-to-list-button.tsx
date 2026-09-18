'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bookmark, Plus, Check, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { SavedList } from '@/lib/types';
import type { EcommProduct } from '@/lib/types';

interface Props {
  product: EcommProduct;
}

export function SaveToListButton({ product }: Props) {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

  async function loadLists() {
    setLoading(true);
    try {
      const res = await fetch('/api/saved-lists');
      if (!res.ok) throw new Error();
      const data: SavedList[] = await res.json();
      setLists(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && isSignedIn && lists.length === 0) {
      loadLists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isSignedIn]);

  async function addToList(listId: string) {
    setAdding(listId);
    try {
      const res = await fetch(`/api/saved-lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          slug: product.slug,
          image: product.images[0] ?? '',
          unit: product.unit,
          qty: Math.max(1, product.moq || 1),
          price: product.price,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as SavedList;
      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success(`Added to "${updated.name}"`);
      setOpen(false);
    } catch {
      toast.error('Failed to add to list');
    } finally {
      setAdding(null);
    }
  }

  async function createListAndAdd() {
    const name = newName.trim();
    if (!name) {
      toast.error('Give the list a name');
      return;
    }
    setCreating(true);
    try {
      const createRes = await fetch('/api/saved-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!createRes.ok) throw new Error();
      const created = (await createRes.json()) as SavedList;
      setLists((prev) => [created, ...prev]);
      setNewName('');
      await addToList(created.id);
    } catch {
      toast.error('Failed to create list');
    } finally {
      setCreating(false);
    }
  }

  if (!isSignedIn) {
    return null;
  }

  const alreadySaved = lists.some((l) =>
    (l.items ?? []).some((i) => i.productId === product.id)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Save to list"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${alreadySaved ? 'fill-current text-primary' : ''}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold">Save to a list</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Group items you reorder regularly.
        </p>
        <div className="mt-3 space-y-1">
          {loading ? (
            <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading lists…
            </p>
          ) : lists.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">
              No lists yet. Create one below.
            </p>
          ) : (
            <ul className="max-h-44 space-y-0.5 overflow-auto">
              {lists.map((list) => {
                const inList = (list.items ?? []).some(
                  (i) => i.productId === product.id
                );
                return (
                  <li key={list.id}>
                    <button
                      type="button"
                      disabled={inList || adding === list.id}
                      onClick={() => addToList(list.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary disabled:opacity-60"
                    >
                      <span className="truncate text-left">{list.name}</span>
                      {inList ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : adding === list.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {(list.items ?? []).length}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            New list
          </p>
          <div className="mt-1.5 flex gap-1.5">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Weekly veg order"
              maxLength={60}
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  createListAndAdd();
                }
              }}
            />
            <Button
              size="sm"
              onClick={createListAndAdd}
              disabled={creating || pending || !newName.trim()}
              className="h-8 gap-1"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Create
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
