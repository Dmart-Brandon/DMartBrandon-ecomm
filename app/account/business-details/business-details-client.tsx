'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Save, Trash2, Star, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidGstin, stateNameFromCode, gstinStateCode } from '@/lib/gst';
import type { BusinessProfile } from '@/lib/types';

type GstinDraft = { gstin: string; label: string; isDefault: boolean };

export function BusinessDetailsClient() {
  const [businessName, setBusinessName] = useState('');
  const [gstins, setGstins] = useState<GstinDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/business-profile')
      .then((r) => r.json())
      .then((data: BusinessProfile | { error?: string }) => {
        if (!active) return;
        if ('error' in data && data.error) {
          toast.error(data.error);
          return;
        }
        const profile = data as BusinessProfile;
        setBusinessName(profile.businessName ?? '');
        setGstins(profile.gstins ?? []);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function patchGstin(idx: number, patch: Partial<GstinDraft>) {
    setGstins((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, ...patch } : g))
    );
    setDirty(true);
  }

  function addEmptyGstin() {
    setGstins((prev) => [
      ...prev,
      { gstin: '', label: '', isDefault: prev.length === 0 },
    ]);
    setDirty(true);
  }

  function removeGstin(idx: number) {
    setGstins((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // Ensure exactly one default remains if any rows left.
      if (next.length > 0 && !next.some((g) => g.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    setDirty(true);
  }

  function setDefault(idx: number) {
    setGstins((prev) =>
      prev.map((g, i) => ({ ...g, isDefault: i === idx }))
    );
    setDirty(true);
  }

  async function save() {
    // Inline validation
    const cleaned = gstins.map((g) => ({
      ...g,
      gstin: g.gstin.trim().toUpperCase(),
      label: g.label.trim(),
    }));
    const invalid = cleaned.find((g) => g.gstin && !isValidGstin(g.gstin));
    if (invalid) {
      toast.error(`"${invalid.gstin}" is not a valid GSTIN`);
      return;
    }
    const seen = new Set<string>();
    for (const g of cleaned) {
      if (!g.gstin) continue;
      if (seen.has(g.gstin)) {
        toast.error(`Duplicate GSTIN: ${g.gstin}`);
        return;
      }
      seen.add(g.gstin);
    }
    const stripped = cleaned.filter((g) => g.gstin);
    startTransition(async () => {
      try {
        const res = await fetch('/api/business-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessName.trim(),
            gstins: stripped,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Save failed');
        }
        const data = (await res.json()) as BusinessProfile;
        setBusinessName(data.businessName ?? '');
        setGstins(data.gstins ?? []);
        setDirty(false);
        toast.success('Business details saved');
      } catch (err: any) {
        toast.error(err.message ?? 'Save failed');
      }
    });
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
            Business details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your business name and GSTIN(s) so we can issue GST invoices on every order.
          </p>
        </div>
        <Button onClick={save} disabled={!dirty || pending} className="gap-2">
          <Save className="h-4 w-4" />
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 h-40 animate-pulse rounded-xl bg-secondary/40" />
      ) : (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <Label htmlFor="businessName" className="text-sm font-semibold">
              Business name
            </Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setDirty(true);
              }}
              placeholder="e.g. Hotel Spice Garden Pvt Ltd"
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This is what we&apos;ll print on every invoice.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">GSTINs</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Add one GSTIN per state. Mark one as default — that&apos;s what we
                  pre-fill at checkout.
                </p>
              </div>
              <Button onClick={addEmptyGstin} variant="outline" size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add GSTIN
              </Button>
            </div>

            {gstins.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-border bg-secondary/40 p-6 text-center text-xs text-muted-foreground">
                No GSTINs yet. Add one to enable GST invoicing.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {gstins.map((g, i) => {
                  const upper = g.gstin.trim().toUpperCase();
                  const valid = !upper || isValidGstin(upper);
                  const stateName = stateNameFromCode(gstinStateCode(upper));
                  return (
                    <li
                      key={i}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_minmax(160px,1fr)_auto]">
                        <div>
                          <Label className="text-xs">GSTIN</Label>
                          <Input
                            value={g.gstin}
                            onChange={(e) =>
                              patchGstin(i, { gstin: e.target.value.toUpperCase() })
                            }
                            placeholder="36ABCDE1234F1Z5"
                            maxLength={15}
                            aria-invalid={!valid}
                            className="mt-1 font-mono uppercase tabular-nums"
                          />
                          {upper && (
                            <p
                              className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${
                                valid ? 'text-primary' : 'text-destructive'
                              }`}
                            >
                              {valid ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Valid
                                  {stateName && (
                                    <span className="ml-1 text-muted-foreground">
                                      · {stateName}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3" />
                                  Check the format
                                </>
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={g.label}
                            onChange={(e) => patchGstin(i, { label: e.target.value })}
                            placeholder="HQ / Hyderabad office"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-end gap-1">
                          <Button
                            type="button"
                            variant={g.isDefault ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDefault(i)}
                            className="gap-1"
                            aria-label={
                              g.isDefault ? 'Default GSTIN' : 'Set as default'
                            }
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                g.isDefault ? 'fill-current' : ''
                              }`}
                            />
                            {g.isDefault ? 'Default' : 'Set default'}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGstin(i)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove GSTIN"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
