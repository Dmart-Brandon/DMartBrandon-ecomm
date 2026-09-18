'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ListPlus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SavedList } from '@/lib/types';

export function SavedListsClient() {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedList | null>(null);

  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    setLoading(true);
    try {
      const res = await fetch('/api/saved-lists');
      if (!res.ok) throw new Error();
      const data = (await res.json()) as SavedList[];
      setLists(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load saved lists');
    } finally {
      setLoading(false);
    }
  }

  async function createList() {
    const name = newName.trim();
    if (!name) {
      toast.error('Give the list a name');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/saved-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const created = (await res.json()) as SavedList;
      setLists((prev) => [created, ...prev]);
      toast.success(`Created "${created.name}"`);
      setNewName('');
      setCreateOpen(false);
    } catch {
      toast.error('Failed to create list');
    } finally {
      setCreating(false);
    }
  }

  async function deleteList() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/saved-lists/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      setLists((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      toast.success(`Deleted "${deleteTarget.name}"`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete list');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to profile
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Account
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Saved lists
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Group items you reorder often and add the whole list to cart in one tap.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <ListPlus className="h-4 w-4" />
          New list
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-secondary/40"
            />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-secondary/40 p-10 text-center">
          <p className="text-sm font-medium">No lists yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first list — e.g. &ldquo;Weekly veg order&rdquo;.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="mt-4 gap-2">
            <ListPlus className="h-4 w-4" />
            Create list
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {lists.map((list) => (
            <li
              key={list.id}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/account/saved-lists/${list.id}`}
                  className="block min-w-0 flex-1 group"
                >
                  <p className="font-semibold group-hover:text-primary">
                    {list.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {(list.items ?? []).length} item
                    {(list.items ?? []).length === 1 ? '' : 's'} · updated{' '}
                    {new Date(list.updatedAt).toLocaleDateString('en-IN')}
                  </p>
                </Link>
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Link href={`/account/saved-lists/${list.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Manage
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(list)}
                    aria-label="Delete list"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    aria-label="Open list"
                  >
                    <Link href={`/account/saved-lists/${list.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a list</DialogTitle>
            <DialogDescription>
              Give your list a memorable name like &ldquo;Weekly veg order&rdquo;
              or &ldquo;Monday bakery&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Weekly veg order"
            maxLength={60}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                createList();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={createList} disabled={creating || !newName.trim()}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete list?</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={deleteList}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
