export interface PriceTier {
  minQty: number;
  price: number;
}

export interface PackSize {
  qty: number;
  unit: string;
  label?: string;
}

export interface EcommProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  categoryName: string;
  categorySlug?: string;
  images: string[];
  secondaryImage?: string;
  stock: number;
  unit: string;
  moq: number;
  stepSize?: number;
  packSize?: PackSize;
  priceTiers?: PriceTier[];
  grade?: string;
  origin?: string;
  shelfLifeDays?: number;
  leadTimeHours?: number;
  warrantyMonths?: number;
  keySpec?: string;
  brand?: string;
  hsnCode?: string;
  deliveryEtaHours?: number;
  sku: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  variants: {
    colors?: { name: string; hex: string }[];
    sizes?: string[];
  };
  specs: Record<string, string>;
  rating: number;
  reviewCount: number;
  createdAt?: string;
}

export interface EcommCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  appliedTierPrice?: number;
  appliedTierMinQty?: number;
  priceTiers?: PriceTier[];
  image: string;
  quantity: number;
  stock?: number;
  unit: string;
  moq: number;
  stepSize?: number;
  packSize?: PackSize;
  hsnCode?: string;
  categoryName?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit?: string;
  image?: string;
  hsnCode?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface TaxBreakdown {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  rate: number;
  isInterState: boolean;
  sellerState: string;
  buyerState: string;
}

export interface EcommOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  userId: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  trackingUrl?: string;
  notes?: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  gstin?: string;
  businessName?: string;
  taxBreakdown?: TaxBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  gstins: { gstin: string; label: string; isDefault: boolean }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedListItem {
  productId: string;
  productName: string;
  slug: string;
  image: string;
  unit: string;
  qty: number;
  price: number;
}

export interface SavedList {
  id: string;
  userId: string;
  name: string;
  items: SavedListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequest {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  businessName?: string;
  gstin?: string;
  items: { productId: string; productName: string; quantity: number; price: number; unit?: string }[];
  cartTotal: number;
  expectedFrequency?: string;
  notes?: string;
  status: 'new' | 'responded' | 'closed';
  createdAt?: string;
  updatedAt?: string;
}

export interface EcommReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface HeroSlideDoc {
  id: string;
  headline: string;
  subText?: string;
  ctaText: string;
  ctaHref: string;
  imageDesktop: string;
  imageMobile?: string;
  displayOrder: number;
  status: 'active' | 'draft';
  startsAt?: string;
  endsAt?: string;
}

export interface AnnouncementDoc {
  id: string;
  message: string;
  displayOrder: number;
  status: 'active' | 'draft';
  startsAt?: string;
  endsAt?: string;
}

export interface FeaturedDoc {
  id: string;
  slot: string;
  productIds: string[];
  startsAt?: string;
  endsAt?: string;
}

export interface RecentlyViewedItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  unit: string;
  viewedAt: number;
}

export type CategoryVariant =
  | 'vegetable'
  | 'fruit'
  | 'dairy'
  | 'cake'
  | 'electronics'
  | 'default';

export function categoryVariantOf(
  categoryName?: string,
  categorySlug?: string
): CategoryVariant {
  const s = (categorySlug || categoryName || '').toLowerCase();
  if (s.includes('veg')) return 'vegetable';
  if (s.includes('fruit')) return 'fruit';
  if (s.includes('dairy')) return 'dairy';
  if (s.includes('cake') || s.includes('bakery')) return 'cake';
  if (s.includes('electronic')) return 'electronics';
  return 'default';
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function activeTier(
  qty: number,
  tiers?: PriceTier[]
): PriceTier | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  return sorted.find((t) => qty >= t.minQty) ?? null;
}

export function nextTier(qty: number, tiers?: PriceTier[]): PriceTier | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  return sorted.find((t) => qty < t.minQty) ?? null;
}
