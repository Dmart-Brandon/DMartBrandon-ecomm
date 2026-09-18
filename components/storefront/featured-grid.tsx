import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';
import { serializeProduct } from '@/lib/serialize';
import { etaFor, getPincode } from '@/lib/pincode';
import { getFeaturedProductIds } from '@/lib/cms';
import { ProductCard } from './product-card';
import { SectionHeader } from './section-header';

async function getFeatured() {
  try {
    await connectToDatabase();

    // 1) Try the CMS Featured doc first
    const ids = await getFeaturedProductIds();
    if (ids.length > 0) {
      const docs = await Product.find({ _id: { $in: ids }, deletedAt: null }).lean();
      const byId = new Map<string, any>();
      for (const d of docs as any[]) byId.set(d._id.toString(), d);
      const ordered = ids
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((p) => serializeProduct(p));
      if (ordered.length > 0) return ordered;
    }

    // 2) Fall back to legacy `featured: true` flag
    let docs = await Product.find({ featured: true, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    if (docs.length === 0) {
      docs = await Product.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(12).lean();
    }
    return (docs as any[]).map((p) => serializeProduct(p));
  } catch {
    return [];
  }
}

export async function FeaturedGrid() {
  const products = await getFeatured();
  if (products.length === 0) return null;
  const pincode = await getPincode();

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="This week"
        title="Featured for businesses"
        subtitle="Hand-picked SKUs with the best bulk pricing"
        viewAllHref="/products?featured=true"
      />
      <div className="-mx-4 overflow-x-auto scrollbar-none px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid snap-x snap-mandatory grid-flow-col auto-cols-[42%] gap-2 sm:auto-cols-[34%] md:auto-cols-[28%] lg:auto-cols-[19%] lg:gap-3 xl:auto-cols-[16.4%]">
          {products.map((p) => (
            <div key={p.id} className="snap-start">
              <ProductCard
                product={p}
                etaLabel={etaFor(pincode, p.leadTimeHours, p.deliveryEtaHours).label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
