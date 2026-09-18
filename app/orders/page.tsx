'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { NavbarClient as Navbar } from '@/components/storefront/navbar-client';
import { AnnouncementsBar } from '@/components/storefront/announcements-bar';
import { Footer } from '@/components/storefront/footer';
import { ReorderButton } from '@/components/storefront/reorder-button';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft, ChevronRight, Truck } from 'lucide-react';
import type { EcommOrder } from '@/lib/types';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function OrdersPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [orders, setOrders] = useState<EcommOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        else setError(data.error || 'Failed to load orders');
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementsBar />
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary/60" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementsBar />
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to view your orders</h1>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementsBar />
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="-ml-3 mb-4">
            <Link href="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">My orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <Package className="h-8 w-8" />
            </span>
            <h2 className="font-display text-xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground">When you place an order, it will show up here.</p>
            <Button asChild className="rounded-xl">
              <Link href="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <Link
                    href={`/orders/${order.id}`}
                    className="block min-w-0 flex-1 space-y-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-semibold tabular-nums group-hover:text-primary">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          STATUS_COLORS[order.status] ||
                          'bg-secondary/60 text-foreground'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item
                      {order.items.length !== 1 ? 's' : ''}
                      {order.items.length > 0 &&
                        `: ${order.items[0].productName}${
                          order.items.length > 1
                            ? ` +${order.items.length - 1} more`
                            : ''
                        }`}
                    </p>
                  </Link>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <p className="font-display text-lg font-bold text-primary tabular-nums">
                      ₹{order.total.toFixed(2)}
                    </p>
                    <ReorderButton
                      items={order.items}
                      size="sm"
                      className="h-8 text-xs"
                    />
                    {order.status === 'shipped' && order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-8"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          Track
                        </Button>
                      </a>
                    )}
                    <Button asChild size="sm" variant="ghost" className="h-8 px-2">
                      <Link
                        href={`/orders/${order.id}`}
                        aria-label="View order"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
