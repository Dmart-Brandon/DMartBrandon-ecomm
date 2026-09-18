import { nameToSlug, type EcommProduct } from '@/lib/types';

/**
 * Centralised serializer for Mongoose Product docs → EcommProduct.
 * Used by both API routes and direct server-component fetches so the
 * shape never drifts between callers.
 */
export function serializeProduct(
  p: any,
  rev: { avg: number; count: number } = { avg: 0, count: 0 }
): EcommProduct {
  const id = p._id?.toString?.() ?? p.id ?? '';
  const specsObj: Record<string, string> = {};
  if (p.specs instanceof Map) {
    p.specs.forEach((v: string, k: string) => {
      specsObj[k] = v;
    });
  } else if (p.specs && typeof p.specs === 'object') {
    Object.assign(specsObj, p.specs);
  }

  return {
    id,
    name: p.name,
    slug: p.slug || nameToSlug(p.name),
    description: p.description || '',
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    categoryId: p.categoryId || '',
    categoryName: p.categoryName || '',
    images: p.images || [],
    secondaryImage: p.secondaryImage || undefined,
    stock: p.stock || 0,
    unit: p.unit || 'piece',
    moq: p.moq || 1,
    stepSize: p.stepSize || 1,
    packSize: p.packSize
      ? {
          qty: p.packSize.qty,
          unit: p.packSize.unit,
          label: p.packSize.label,
        }
      : undefined,
    priceTiers: Array.isArray(p.priceTiers)
      ? p.priceTiers.map((t: any) => ({ minQty: t.minQty, price: t.price }))
      : [],
    grade: p.grade || undefined,
    origin: p.origin || undefined,
    shelfLifeDays: p.shelfLifeDays,
    leadTimeHours: p.leadTimeHours,
    warrantyMonths: p.warrantyMonths,
    keySpec: p.keySpec || undefined,
    brand: p.brand || undefined,
    hsnCode: p.hsnCode || undefined,
    deliveryEtaHours: p.deliveryEtaHours,
    sku: p.sku || id,
    featured: p.featured || false,
    newArrival: p.newArrival || false,
    bestseller: p.bestseller || false,
    variants: p.variants || {},
    specs: specsObj,
    rating: Math.round((rev.avg ?? 0) * 10) / 10,
    reviewCount: rev.count ?? 0,
    createdAt: p.createdAt instanceof Date
      ? p.createdAt.toISOString()
      : typeof p.createdAt === 'string'
        ? p.createdAt
        : undefined,
  };
}
