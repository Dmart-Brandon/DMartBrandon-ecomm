'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser } from '@clerk/nextjs';
import { NavbarClient as Navbar } from '@/components/storefront/navbar-client';
import { AnnouncementsBar } from '@/components/storefront/announcements-bar';
import { Footer } from '@/components/storefront/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/lib/cart-context';
import { GstinSection, type GstinSectionValue } from '@/components/storefront/gstin-section';
import { computeTax } from '@/lib/tax';
import { isValidGstin } from '@/lib/gst';
import { ShoppingBasket, ArrowLeft, CheckCircle, Phone } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'PIN code is required'),
  country: z.string().min(2, 'Country is required'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING = 99;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderNumber: string;
    orderId: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [pendingData, setPendingData] = useState<CheckoutFormData | null>(null);
  const [gstSection, setGstSection] = useState<GstinSectionValue>({
    enabled: false,
    gstin: '',
    businessName: '',
    saveToProfile: true,
  });
  const [shippingState, setShippingState] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.fullName || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
      country: 'India',
    },
  });

  // Watch the state field so the tax breakdown updates live as the buyer types.
  const watchedState = watch('state');
  useEffect(() => {
    setShippingState(watchedState ?? '');
  }, [watchedState]);

  const shipping =
    totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

  const taxBreakdown = useMemo(() => {
    return computeTax(
      items.map((i) => ({
        hsnCode: i.hsnCode,
        categoryName: i.categoryName,
        price: i.price,
        quantity: i.quantity,
      })),
      {
        buyerStateInput: shippingState,
        buyerGstin: gstSection.enabled ? gstSection.gstin : undefined,
      }
    );
  }, [items, shippingState, gstSection.enabled, gstSection.gstin]);

  const showGstLine = gstSection.enabled && taxBreakdown.subtotal > 0;
  const grandTotal = showGstLine
    ? taxBreakdown.total + shipping
    : totalPrice + shipping;

  if (items.length === 0 && !successOpen) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementsBar />
        <Navbar />
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-primary">
              <ShoppingBasket className="h-10 w-10" />
            </span>
            <h1 className="font-display text-3xl font-bold">Your basket is empty</h1>
            <Button asChild className="rounded-xl">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Shop now
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = (data: CheckoutFormData) => {
    setPendingData(data);
    setError('');
    if (
      gstSection.enabled &&
      gstSection.gstin &&
      !isValidGstin(gstSection.gstin)
    ) {
      // Brief: if GSTIN is malformed, still allow but show confirmation modal.
      setConfirmOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const confirmAndSend = async () => {
    if (!pendingData) return;
    setIsSubmitting(true);
    setError('');

    try {
      const body = {
        customer: pendingData,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          unit: i.unit,
          image: i.image,
          hsnCode: i.hsnCode ?? '',
        })),
        subtotal: totalPrice,
        shipping,
        total: grandTotal,
        gst: gstSection.enabled
          ? {
              gstin: gstSection.gstin.trim().toUpperCase(),
              businessName: gstSection.businessName.trim(),
              saveToProfile: gstSection.saveToProfile,
              taxBreakdown,
            }
          : null,
      };
      const res = await fetch('/api/contact-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit your order request.');
      }

      setSubmittedOrder({ orderNumber: json.orderNumber, orderId: json.orderId });
      clearCart();
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementsBar />
      <Navbar />

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="-ml-3 mb-4 text-primary hover:text-primary">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to basket
            </Link>
          </Button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Almost there</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Request your order
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Share your details below — our team will contact you to confirm
              availability, delivery slot, and payment. No card charged right now.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="mb-6 font-display text-xl font-semibold">Your details</h2>

                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" placeholder="Priya Sharma" {...register('name')} />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="priya@example.com"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street address</Label>
                    <Input
                      id="address"
                      placeholder="Flat 4B, 123 Banjara Hills"
                      {...register('address')}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Hyderabad" {...register('city')} />
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="Telangana" {...register('state')} />
                      {errors.state && (
                        <p className="text-sm text-destructive">{errors.state.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">PIN code</Label>
                      <Input id="zipCode" placeholder="500034" {...register('zipCode')} />
                      {errors.zipCode && (
                        <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="India" {...register('country')} />
                    {errors.country && (
                      <p className="text-sm text-destructive">{errors.country.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes for the team (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Preferred delivery time, substitution preferences, landmark, etc."
                      rows={3}
                      {...register('notes')}
                    />
                  </div>
                </div>
              </div>

              <GstinSection
                value={gstSection}
                onChange={setGstSection}
                defaultBusinessName={user?.fullName ?? ''}
              />

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl"
                disabled={isSubmitting}
              >
                <Phone className="mr-2 h-5 w-5" />
                Place order
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                We&apos;ll confirm by email within a few hours. Nothing is charged
                at this step.
              </p>
            </form>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Order summary</h2>

              <div className="mb-4 space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBasket className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                      )}
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground tabular-nums">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4 tabular-nums">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal (net)</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                {showGstLine ? (
                  taxBreakdown.isInterState ? (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>IGST</span>
                      <span>₹{taxBreakdown.igst.toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>CGST</span>
                        <span>₹{taxBreakdown.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>SGST</span>
                        <span>₹{taxBreakdown.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )
                ) : null}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Estimated total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
                {showGstLine && (
                  <p className="text-[11px] text-muted-foreground">
                    GST {taxBreakdown.rate.toFixed(2)}% effective rate ·{' '}
                    {taxBreakdown.isInterState
                      ? `inter-state (${taxBreakdown.sellerState} → ${
                          taxBreakdown.buyerState || '?'
                        })`
                      : `intra-state (${taxBreakdown.sellerState})`}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-primary">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Final pricing confirmed over call — subject to availability and
                  current market rates.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Place order?</DialogTitle>
            <DialogDescription>
              We&apos;ll share your basket and contact details with our orders
              team. They&apos;ll call or email {pendingData?.email} to confirm.
            </DialogDescription>
          </DialogHeader>

          {gstSection.enabled &&
            gstSection.gstin &&
            !isValidGstin(gstSection.gstin) && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Heads up: the GSTIN you entered ({gstSection.gstin}) doesn&apos;t
                match the standard format. Place the order without a GST invoice
                or go back to fix it?
              </div>
            )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2 rounded-xl bg-secondary/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated total</span>
              <span className="font-semibold">₹{grandTotal.toFixed(2)}</span>
            </div>
            {gstSection.enabled && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST invoice</span>
                <span className="font-medium">
                  {gstSection.gstin ? gstSection.gstin : 'Yes'}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={confirmAndSend}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? 'Sending…' : 'Yes, place order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="font-display text-xl">
              Order received
            </DialogTitle>
            <DialogDescription>
              Thanks, {submittedOrder && pendingData?.name}. Your reference
              number is{' '}
              <span className="font-mono font-semibold text-foreground">
                {submittedOrder?.orderNumber}
              </span>
              . We&apos;ll reach out shortly to confirm and arrange delivery.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push('/products')}
            >
              Keep shopping
            </Button>
            {submittedOrder && (
              <Button
                className="rounded-xl"
                onClick={() => router.push(`/orders/${submittedOrder.orderId}`)}
              >
                View order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
