'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { NavbarClient as Navbar } from '@/components/storefront/navbar-client';
import { Footer } from '@/components/storefront/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft, Clock, CheckCircle, MessageSquare } from 'lucide-react';

type QuoteItem = {
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  unit?: string;
};

type Quote = {
  id: string;
  customerName: string;
  businessName?: string;
  items: QuoteItem[];
  cartTotal: number;
  expectedFrequency?: string;
  status: 'new' | 'responded' | 'closed';
  createdAt?: string;
};

const STATUS_CONFIG = {
  new: { label: 'Pending', color: 'bg-blue-100 text-blue-700', icon: Clock },
  responded: { label: 'Responded', color: 'bg-amber-100 text-amber-700', icon: MessageSquare },
  closed: { label: 'Closed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function MyQuotesPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetch('/api/quotes')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuotes(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary/60" />
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
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4">Sign in to view your quotes</h1>
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
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">My quotes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {quotes.length} quote request{quotes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <FileText className="h-8 w-8" />
            </span>
            <h2 className="font-display text-xl font-semibold">No quote requests yet</h2>
            <p className="text-muted-foreground">
              When you request a bulk quote, it will show up here with status updates.
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => {
              const config = STATUS_CONFIG[quote.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={quote.id}
                  className="rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${config.color} gap-1`} variant="outline">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                        {quote.expectedFrequency && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {quote.expectedFrequency}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quote.createdAt &&
                          new Date(quote.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quote.items.length} item{quote.items.length !== 1 ? 's' : ''}
                        {quote.items.length > 0 &&
                          `: ${quote.items[0].productName}${
                            quote.items.length > 1
                              ? ` +${quote.items.length - 1} more`
                              : ''
                          }`}
                      </p>
                    </div>
                    <p className="font-display text-lg font-bold text-primary tabular-nums shrink-0">
                      ₹{quote.cartTotal.toFixed(2)}
                    </p>
                  </div>

                  {quote.status === 'responded' && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                      Our team has responded — check your email or phone for the quote details.
                    </div>
                  )}
                  {quote.status === 'new' && (
                    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                      Your request is being reviewed. We'll get back within one business day.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
