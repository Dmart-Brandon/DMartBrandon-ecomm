'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Package,
  ArrowLeft,
  ShoppingBag,
  Truck,
  FileText,
} from 'lucide-react';
import { NavbarClient as Navbar } from '@/components/storefront/navbar-client';
import { AnnouncementsBar } from '@/components/storefront/announcements-bar';
import { Footer } from '@/components/storefront/footer';
import { ReorderButton } from '@/components/storefront/reorder-button';
import { Button } from '@/components/ui/button';
import type { EcommOrder } from '@/lib/types';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-destructive/10 text-destructive',
};

function formatINR(n: number) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [order, setOrder] = useState<EcommOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setOrder(data);
        else setError(data.error || 'Order not found');
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementsBar />
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-secondary/60 rounded animate-pulse" />
            <div className="h-48 rounded-lg bg-secondary/60 animate-pulse" />
            <div className="h-48 rounded-lg bg-secondary/60 animate-pulse" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementsBar />
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/60 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order not found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const breakdown = order.taxBreakdown;
  const isGst = !!order.gstin && !!breakdown;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementsBar />
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {isSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
            <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-primary">Order placed successfully!</p>
              <p className="text-sm text-primary/80">
                Thank you for your purchase. We&apos;ll send you an update when your order ships.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Orders
            </Link>
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tabular-nums">
                {order.orderNumber}
              </h1>
              <p className="text-muted-foreground text-sm">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${
                  STATUS_COLORS[order.status] || 'bg-secondary/60 text-foreground'
                }`}
              >
                {order.status}
              </span>
              {order.status === 'shipped' && order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="gap-2">
                    <Truck className="h-4 w-4" />
                    Track Order
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <ReorderButton items={order.items} variant="primary" />
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/orders/${order.id}/invoice`} target="_blank">
              <FileText className="h-4 w-4" />
              {isGst ? 'Download GST invoice' : 'Download invoice'}
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {/* Items */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Order Items</h2>
            <div className="divide-y">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-secondary/60">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground/60" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
                      {item.selectedColor && <span>{item.selectedColor}</span>}
                      {item.selectedSize && <span>· {item.selectedSize}</span>}
                      <span>· {item.quantity} {item.unit ?? ''}</span>
                    </div>
                  </div>
                  <p className="font-medium tabular-nums">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4 space-y-2 tabular-nums">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal (net)</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {isGst && breakdown && (
                <>
                  {breakdown.isInterState ? (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>IGST</span>
                      <span>{formatINR(breakdown.igst)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>CGST</span>
                        <span>{formatINR(breakdown.cgst)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>SGST</span>
                        <span>{formatINR(breakdown.sgst)}</span>
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
              {isGst && breakdown && (
                <p className="text-[11px] text-muted-foreground">
                  GST {breakdown.rate.toFixed(2)}% effective ·{' '}
                  {breakdown.isInterState
                    ? `inter-state (${breakdown.sellerState} → ${
                        breakdown.buyerState || '?'
                      })`
                    : `intra-state (${breakdown.sellerState})`}
                </p>
              )}
            </div>
          </div>

          {/* GST details */}
          {isGst && (
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="mb-3 font-semibold text-lg">Tax invoice details</h2>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Business name</dt>
                  <dd className="font-medium text-right">
                    {order.businessName || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">GSTIN</dt>
                  <dd className="font-mono">{order.gstin}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 font-semibold text-lg">Shipping Address</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-1">{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.email}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
