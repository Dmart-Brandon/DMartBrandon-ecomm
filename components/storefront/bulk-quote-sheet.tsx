'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/lib/cart-context';
import type { BusinessProfile } from '@/lib/types';

export const BULK_QUOTE_OPEN_EVENT = 'dmartbrandon:open-bulk-quote';

export function openBulkQuote() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BULK_QUOTE_OPEN_EVENT));
}

export function BulkQuoteSheet() {
  const { user } = useUser();
  const { items, totalPrice } = useCart();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    businessName: '',
    gstin: '',
    expectedFrequency: 'one-time',
    notes: '',
  });

  // Listen for the global open event so navbar / cart banner can both trigger it.
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener(BULK_QUOTE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(BULK_QUOTE_OPEN_EVENT, onOpen);
  }, []);

  // Pre-fill from Clerk + BusinessProfile when sheet opens.
  useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user?.fullName || '',
      customerEmail:
        prev.customerEmail || user?.emailAddresses[0]?.emailAddress || '',
    }));
    fetch('/api/business-profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((raw) => {
        if (!raw || raw.error) return;
        const data = raw as BusinessProfile;
        setForm((prev) => ({
          ...prev,
          businessName: prev.businessName || data.businessName || '',
          gstin:
            prev.gstin ||
            (data.gstins?.find((g) => g.isDefault)?.gstin ??
              data.gstins?.[0]?.gstin ??
              ''),
        }));
      })
      .catch(() => {
        // signed-out users get 401; harmless
      });
  }, [open, user]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit() {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!form.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    if (!form.customerPhone.trim()) newErrors.customerPhone = 'Phone is required';
    else if (form.customerPhone.trim().length < 7) newErrors.customerPhone = 'Enter a valid phone number';
    if (!form.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!form.expectedFrequency) newErrors.expectedFrequency = 'Frequency is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill all required fields.');
      return;
    }
    if (items.length === 0) {
      toast.error('Add items to your cart before requesting a quote.');
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          businessName: form.businessName.trim(),
          gstin: form.gstin.trim().toUpperCase(),
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            unit: i.unit,
          })),
          cartTotal: totalPrice,
          expectedFrequency: form.expectedFrequency,
          notes: form.notes.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Submit failed');
      }
      toast.success(
        'Quote received. Our team will respond within one business day.'
      );
      setOpen(false);
      setForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        businessName: '',
        gstin: '',
        expectedFrequency: 'one-time',
        notes: '',
      });
      setErrors({});
    } catch (err: any) {
      toast.error(err.message ?? 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Request a custom quote
          </SheetTitle>
          <SheetDescription>
            Tell us about your business and we&apos;ll get back with a tailored
            quote — usually within one business day.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="bq-name">Your name <span className="text-red-500">*</span></Label>
              <Input
                id="bq-name"
                value={form.customerName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, customerName: e.target.value }));
                  if (errors.customerName) setErrors((e) => ({ ...e, customerName: '' }));
                }}
                placeholder="Priya Sharma"
                className="mt-1.5"
              />
              {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
            </div>
            <div>
              <Label htmlFor="bq-email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="bq-email"
                type="email"
                value={form.customerEmail}
                onChange={(e) => {
                  setForm((f) => ({ ...f, customerEmail: e.target.value }));
                  if (errors.customerEmail) setErrors((e) => ({ ...e, customerEmail: '' }));
                }}
                placeholder="priya@example.com"
                className="mt-1.5"
              />
              {errors.customerEmail && <p className="mt-1 text-xs text-red-500">{errors.customerEmail}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="bq-phone">Phone <span className="text-red-500">*</span></Label>
            <Input
              id="bq-phone"
              type="tel"
              value={form.customerPhone}
              onChange={(e) => {
                setForm((f) => ({ ...f, customerPhone: e.target.value }));
                if (errors.customerPhone) setErrors((e) => ({ ...e, customerPhone: '' }));
              }}
              placeholder="+91 98765 43210"
              className="mt-1.5"
            />
            {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>}
          </div>
          <div>
            <Label htmlFor="bq-business">Business name <span className="text-red-500">*</span></Label>
            <Input
              id="bq-business"
              value={form.businessName}
              onChange={(e) => {
                setForm((f) => ({ ...f, businessName: e.target.value }));
                if (errors.businessName) setErrors((e) => ({ ...e, businessName: '' }));
              }}
              placeholder="Hotel Spice Garden Pvt Ltd"
              className="mt-1.5"
            />
            {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
          </div>
          <div>
            <Label htmlFor="bq-gstin">GSTIN (optional)</Label>
            <Input
              id="bq-gstin"
              value={form.gstin}
              onChange={(e) =>
                setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))
              }
              placeholder="36ABCDE1234F1Z5"
              maxLength={15}
              className="mt-1.5 font-mono uppercase tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor="bq-frequency">Expected frequency <span className="text-red-500">*</span></Label>
            <Select
              value={form.expectedFrequency}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, expectedFrequency: v }))
              }
            >
              <SelectTrigger id="bq-frequency" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time order</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bq-notes">Notes</Label>
            <Textarea
              id="bq-notes"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Special requirements, bulk volumes, delivery cadence, payment preference…"
              rows={4}
              className="mt-1.5"
            />
          </div>

          {items.length > 0 ? (
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Items in your cart
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {items.slice(0, 6).map((i) => (
                  <li
                    key={i.productId}
                    className="flex items-center justify-between tabular-nums"
                  >
                    <span className="truncate pr-2">{i.productName}</span>
                    <span className="text-muted-foreground">
                      {i.quantity} × ₹{i.price}
                    </span>
                  </li>
                ))}
                {items.length > 6 && (
                  <li className="text-muted-foreground">
                    +{items.length - 6} more
                  </li>
                )}
              </ul>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-xs font-semibold tabular-nums">
                <span>Cart total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
              <p className="text-sm font-medium text-amber-800">No items in cart</p>
              <p className="mt-1 text-xs text-amber-700">
                Add products to your cart first, then request a bulk quote.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border px-6 py-4">
          <SheetClose asChild>
            <Button variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </SheetClose>
          <Button onClick={submit} disabled={submitting} className="gap-2">
            <Send className="h-4 w-4" />
            {submitting ? 'Sending…' : 'Send quote request'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
