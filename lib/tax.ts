import type { TaxBreakdown } from '@/lib/types';
import { gstinStateCode, normalizeStateInput, stateAbbrFromCode } from '@/lib/gst';

// Seller of record. Hardcoded for Phase C. Move to env var or admin config later.
export const SELLER_STATE = 'TS';

// HSN-prefix → GST rate (%). 5/12/18% buckets are simplified for this build.
// Real Indian GST has more buckets (0/0.25/3/5/12/18/28); production should
// load from a CBIC-aligned table maintained by the seller's accountant.
const HSN_RATES: Record<string, number> = {
  // Electronics, IT hardware, lighting → 18%
  '8443': 18,
  '8471': 18,
  '8504': 18,
  '8516': 18,
  '8517': 18,
  '8528': 18,
  '8539': 18,
  // Bakery products, prepared foods → 18%
  '1905': 18,
  // Fresh produce / dairy / spices → 5%
  '0401': 5,
  '0402': 5,
  '0403': 5,
  '0405': 5,
  '0406': 5,
  '0701': 5,
  '0702': 5,
  '0703': 5,
  '0706': 5,
  '0709': 5,
  '0803': 5,
  '0804': 5,
  '0805': 5,
  '0806': 5,
  '0808': 5,
};

const ELECTRONICS_FALLBACK_RATE = 18;
const DEFAULT_RATE = 5;

export interface TaxLine {
  hsnCode?: string;
  categoryName?: string;
  price: number;
  quantity: number;
}

export function rateForLine(line: TaxLine): number {
  const prefix = (line.hsnCode ?? '').slice(0, 4);
  if (prefix && HSN_RATES[prefix] !== undefined) return HSN_RATES[prefix];
  if ((line.categoryName ?? '').toLowerCase().includes('electronic')) {
    return ELECTRONICS_FALLBACK_RATE;
  }
  if ((line.categoryName ?? '').toLowerCase().includes('cake') ||
      (line.categoryName ?? '').toLowerCase().includes('bakery')) {
    return ELECTRONICS_FALLBACK_RATE;
  }
  return DEFAULT_RATE;
}

interface ComputeOptions {
  /** Free-text or 2-letter shipping state, e.g. "Telangana" or "TS". */
  buyerStateInput?: string;
  /** GSTIN of buyer; used to derive state if shipping state is missing/unclear. */
  buyerGstin?: string;
  /** Shipping fee added to the taxable base evenly (rare; default 0). */
  shippingFee?: number;
  /** Override seller state. */
  sellerState?: string;
}

/**
 * Computes a single tax breakdown for an order. Each line is taxed at its own
 * rate; we then aggregate to a single CGST+SGST or IGST split based on whether
 * the buyer and seller are in the same state.
 *
 * Treats `line.price` as the **net** (pre-GST) per-unit price. Final invoice
 * total = subtotal + GST. The cart's grand total continues to be derived from
 * the line price × qty (i.e. what the buyer sees on the cart page is net).
 */
export function computeTax(
  lines: TaxLine[],
  opts: ComputeOptions = {}
): TaxBreakdown {
  const sellerState = opts.sellerState ?? SELLER_STATE;
  let buyerState = '';
  if (opts.buyerStateInput) {
    const normalized = normalizeStateInput(opts.buyerStateInput);
    // If the user typed a numeric state code via GSTIN flow, translate.
    buyerState = normalized.length === 2 && /^[A-Z]{2}$/.test(normalized)
      ? normalized
      : stateAbbrFromCode(normalized) || normalized;
  }
  if (!buyerState && opts.buyerGstin) {
    const code = gstinStateCode(opts.buyerGstin);
    buyerState = stateAbbrFromCode(code);
  }
  const isInterState = !!buyerState && buyerState !== sellerState;

  let subtotal = 0;
  let totalGst = 0;
  let weightedRateNumerator = 0;

  for (const line of lines) {
    const lineNet = line.price * line.quantity;
    const rate = rateForLine(line);
    const lineGst = (lineNet * rate) / 100;
    subtotal += lineNet;
    totalGst += lineGst;
    weightedRateNumerator += lineNet * rate;
  }

  const cgst = isInterState ? 0 : totalGst / 2;
  const sgst = isInterState ? 0 : totalGst / 2;
  const igst = isInterState ? totalGst : 0;

  const effectiveRate = subtotal > 0 ? weightedRateNumerator / subtotal : 0;

  return {
    subtotal: round2(subtotal),
    cgst: round2(cgst),
    sgst: round2(sgst),
    igst: round2(igst),
    total: round2(subtotal + totalGst + (opts.shippingFee ?? 0)),
    rate: round2(effectiveRate),
    isInterState,
    sellerState,
    buyerState,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
