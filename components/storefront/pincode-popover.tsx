'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidPincode, PINCODE_COOKIE, pincodeRegion } from '@/lib/pincode';
import { cn } from '@/lib/utils';

type Variant = 'inline' | 'compact';

export function PincodePopover({
  initialPincode,
  variant = 'inline',
  className,
}: {
  initialPincode: string;
  variant?: Variant;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialPincode);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const region = pincodeRegion(initialPincode);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!isValidPincode(trimmed)) {
      setError('Enter a valid 6-digit pincode');
      return;
    }
    setError(null);
    document.cookie = `${PINCODE_COOKIE}=${trimmed}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.refresh();
      setOpen(false);
    });
  }

  const trigger =
    variant === 'compact' ? (
      <button
        type="button"
        aria-label={`Deliver to ${initialPincode}`}
        className={cn(
          'inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2 text-[11px] font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary',
          className
        )}
      >
        <MapPin className="h-3.5 w-3.5" />
        <span className="font-semibold tabular-nums">{initialPincode}</span>
      </button>
    ) : (
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80 transition-colors hover:text-primary',
          className
        )}
      >
        <MapPin className="h-3.5 w-3.5" />
        <span>
          Deliver to{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {initialPincode}
          </span>
          <span className="ml-1 text-foreground/60">· {region}</span>
        </span>
      </button>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Choose your delivery pincode</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              We&apos;ll show stock and delivery times for this area.
            </p>
          </div>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={value}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, '');
              setValue(v);
              if (error) setError(null);
            }}
            placeholder="6-digit pincode"
            aria-invalid={!!error}
            className="tabular-nums"
          />
          {error ? (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          ) : isValidPincode(value) ? (
            <p className="flex items-center gap-1 text-xs text-primary">
              <Check className="h-3.5 w-3.5" /> Delivering to {pincodeRegion(value)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Example: 500032, 560001, 110001
            </p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Updating…' : 'Apply pincode'}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
