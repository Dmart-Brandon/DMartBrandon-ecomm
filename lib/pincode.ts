export const PINCODE_COOKIE = 'hb_pincode';
export const DEFAULT_PINCODE = '500032';

export function isValidPincode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}

export function pincodeRegion(pin: string): string {
  if (!isValidPincode(pin)) return 'India';
  const prefix = pin.slice(0, 3);
  const map: Record<string, string> = {
    '500': 'Hyderabad',
    '501': 'Hyderabad',
    '502': 'Hyderabad',
    '560': 'Bengaluru',
    '600': 'Chennai',
    '400': 'Mumbai',
    '110': 'Delhi NCR',
    '700': 'Kolkata',
    '380': 'Ahmedabad',
    '411': 'Pune',
  };
  return map[prefix] ?? 'India';
}

export type DeliveryEta = {
  label: string;
  hours: number;
  isSameDay: boolean;
};

export function etaFor(
  pincode: string,
  leadTimeHours?: number,
  deliveryEtaHours?: number
): DeliveryEta {
  const lead = leadTimeHours ?? 0;
  const base = deliveryEtaHours ?? 24;
  const hours = lead + base;

  let label: string;
  if (lead >= 24) {
    const days = Math.ceil(lead / 24);
    label = `Pre-order · ships in ${days} day${days > 1 ? 's' : ''}`;
  } else if (hours <= 12) {
    label = 'Same day · by 8 PM';
  } else if (hours <= 24) {
    label = 'Tomorrow by 8 AM';
  } else if (hours <= 48) {
    label = 'In 2 days';
  } else {
    const days = Math.ceil(hours / 24);
    label = `Ships in ${days} days`;
  }

  return {
    label,
    hours,
    isSameDay: hours <= 12 && lead < 24,
  };
}

// Server-only: dynamic import to avoid pulling next/headers into client bundles
export async function getPincode(): Promise<string> {
  try {
    const { cookies } = await import('next/headers');
    const v = cookies().get(PINCODE_COOKIE)?.value;
    if (v && isValidPincode(v)) return v;
  } catch {
    // not in server context
  }
  return DEFAULT_PINCODE;
}
