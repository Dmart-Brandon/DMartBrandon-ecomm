'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, FileText, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isValidGstin, stateNameFromCode, gstinStateCode } from '@/lib/gst';
import type { BusinessProfile } from '@/lib/types';

export interface GstinSectionValue {
  enabled: boolean;
  gstin: string;
  businessName: string;
  saveToProfile: boolean;
}

interface Props {
  value: GstinSectionValue;
  onChange: (next: GstinSectionValue) => void;
  defaultBusinessName?: string;
}

export function GstinSection({ value, onChange, defaultBusinessName }: Props) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/business-profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data || data.error) return;
        setProfile(data as BusinessProfile);
        // Pre-fill with default GSTIN + business name when first loading.
        if (data.businessName && !value.businessName) {
          onChange({ ...value, businessName: data.businessName });
        }
        if (Array.isArray(data.gstins) && data.gstins.length > 0) {
          const def = data.gstins.find((g: any) => g.isDefault) ?? data.gstins[0];
          if (def && !value.gstin) {
            onChange({ ...value, gstin: def.gstin });
          }
        }
      })
      .catch(() => {
        // signed-out users get 401; harmless.
      })
      .finally(() => active && setLoadingProfile(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upper = value.gstin.trim().toUpperCase();
  const valid = !upper || isValidGstin(upper);
  const stateName = stateNameFromCode(gstinStateCode(upper));
  const savedGstins = profile?.gstins ?? [];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={value.enabled}
          onCheckedChange={(checked) =>
            onChange({ ...value, enabled: checked === true })
          }
          aria-label="I need a GST invoice"
          className="mt-0.5"
        />
        <span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            I need a GST invoice for this order
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            We&apos;ll generate a tax invoice with HSN codes and GST split. Optional —
            non-GST buyers can place orders in one click.
          </span>
        </span>
      </label>

      {value.enabled && (
        <div className="mt-5 space-y-4 border-t border-border pt-5">
          {savedGstins.length > 0 && !showCustom ? (
            <div>
              <Label htmlFor="saved-gstin">Saved GSTINs</Label>
              <Select
                value={value.gstin}
                onValueChange={(v) => {
                  if (v === '__custom__') {
                    setShowCustom(true);
                    onChange({ ...value, gstin: '' });
                  } else {
                    onChange({ ...value, gstin: v });
                  }
                }}
              >
                <SelectTrigger id="saved-gstin" className="mt-1.5">
                  <SelectValue placeholder="Choose a GSTIN" />
                </SelectTrigger>
                <SelectContent>
                  {savedGstins.map((g) => (
                    <SelectItem key={g.gstin} value={g.gstin}>
                      <span className="font-mono">{g.gstin}</span>
                      {g.label && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          · {g.label}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">
                    <span className="inline-flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      Use a different GSTIN
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {upper && stateName && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary">
                  <Check className="h-3 w-3" />
                  Registered in {stateName}
                </p>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="gstin-input">GSTIN</Label>
              <Input
                id="gstin-input"
                value={value.gstin}
                onChange={(e) =>
                  onChange({ ...value, gstin: e.target.value.toUpperCase() })
                }
                placeholder="36ABCDE1234F1Z5"
                maxLength={15}
                aria-invalid={!valid}
                className="mt-1.5 font-mono uppercase tabular-nums"
              />
              {upper ? (
                valid ? (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary">
                    <Check className="h-3 w-3" />
                    Valid GSTIN
                    {stateName && (
                      <span className="ml-1 text-muted-foreground">
                        · {stateName}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    Doesn&apos;t match the GSTIN format. We&apos;ll ask you to confirm.
                  </p>
                )
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  15 characters. Example: 36ABCDE1234F1Z5
                </p>
              )}
              {savedGstins.length > 0 && (
                <button
                  type="button"
                  className="mt-2 text-xs text-primary hover:underline"
                  onClick={() => setShowCustom(false)}
                >
                  ← Use a saved GSTIN
                </button>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="invoice-business-name">
              Business name on invoice
            </Label>
            <Input
              id="invoice-business-name"
              value={value.businessName}
              onChange={(e) =>
                onChange({ ...value, businessName: e.target.value })
              }
              placeholder={defaultBusinessName ?? 'Hotel Spice Garden Pvt Ltd'}
              className="mt-1.5"
            />
            {loadingProfile && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Loading saved details…
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={value.saveToProfile}
              onCheckedChange={(checked) =>
                onChange({ ...value, saveToProfile: checked === true })
              }
            />
            Save this GSTIN to my account for future orders
          </label>

          <p className="text-[11px] text-muted-foreground">
            Manage your saved GSTINs anytime under{' '}
            <Link
              href="/account/business-details"
              className="text-primary hover:underline"
            >
              Business details
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
