/**
 * Indian GSTIN regex per CBIC spec.
 * 15 chars: 2-digit state code, 5-letter PAN block, 4-digit PAN year/owner,
 * 1 PAN entity letter, 1 alphanumeric (registration count), Z, 1 check char.
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isValidGstin(g: string): boolean {
  return GSTIN_REGEX.test(g.trim().toUpperCase());
}

/**
 * Returns the 2-digit state code embedded in a GSTIN, or empty string.
 * Example: "36ABCDE1234F1Z5" → "36" (Telangana).
 */
export function gstinStateCode(g: string): string {
  if (!g) return '';
  const upper = g.trim().toUpperCase();
  if (!isValidGstin(upper)) return '';
  return upper.slice(0, 2);
}

// Subset of Indian state codes used for invoice rendering and intra/inter-state checks.
// Source: GST state codes published by CBIC.
export const STATE_CODES: Record<string, { code: string; name: string }> = {
  '01': { code: 'JK', name: 'Jammu & Kashmir' },
  '02': { code: 'HP', name: 'Himachal Pradesh' },
  '03': { code: 'PB', name: 'Punjab' },
  '04': { code: 'CH', name: 'Chandigarh' },
  '05': { code: 'UK', name: 'Uttarakhand' },
  '06': { code: 'HR', name: 'Haryana' },
  '07': { code: 'DL', name: 'Delhi' },
  '08': { code: 'RJ', name: 'Rajasthan' },
  '09': { code: 'UP', name: 'Uttar Pradesh' },
  '10': { code: 'BR', name: 'Bihar' },
  '11': { code: 'SK', name: 'Sikkim' },
  '12': { code: 'AR', name: 'Arunachal Pradesh' },
  '13': { code: 'NL', name: 'Nagaland' },
  '14': { code: 'MN', name: 'Manipur' },
  '15': { code: 'MZ', name: 'Mizoram' },
  '16': { code: 'TR', name: 'Tripura' },
  '17': { code: 'ML', name: 'Meghalaya' },
  '18': { code: 'AS', name: 'Assam' },
  '19': { code: 'WB', name: 'West Bengal' },
  '20': { code: 'JH', name: 'Jharkhand' },
  '21': { code: 'OR', name: 'Odisha' },
  '22': { code: 'CG', name: 'Chhattisgarh' },
  '23': { code: 'MP', name: 'Madhya Pradesh' },
  '24': { code: 'GJ', name: 'Gujarat' },
  '27': { code: 'MH', name: 'Maharashtra' },
  '29': { code: 'KA', name: 'Karnataka' },
  '30': { code: 'GA', name: 'Goa' },
  '32': { code: 'KL', name: 'Kerala' },
  '33': { code: 'TN', name: 'Tamil Nadu' },
  '34': { code: 'PY', name: 'Puducherry' },
  '36': { code: 'TS', name: 'Telangana' },
  '37': { code: 'AP', name: 'Andhra Pradesh' },
};

/** Returns the 2-letter abbreviation (e.g. "TS") for a numeric GSTIN state code. */
export function stateAbbrFromCode(code: string): string {
  return STATE_CODES[code]?.code ?? '';
}

/** Returns the human-readable state name for a numeric code. */
export function stateNameFromCode(code: string): string {
  return STATE_CODES[code]?.name ?? '';
}

/**
 * Best-effort mapping from a free-text shipping state input to a 2-letter abbr.
 * Accepts already-2-letter codes, full names, and a few common aliases.
 */
export function normalizeStateInput(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  const lower = trimmed.toLowerCase();
  for (const { code, name } of Object.values(STATE_CODES)) {
    if (name.toLowerCase() === lower) return code;
  }
  return trimmed.toUpperCase();
}
