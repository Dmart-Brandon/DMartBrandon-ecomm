import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';
import { Order } from '@/lib/models/Order';
import { auth } from '@clerk/nextjs/server';
import { serializeProduct } from '@/lib/serialize';
import { etaFor, getPincode } from '@/lib/pincode';
import { ProductCard } from './product-card';
import { SectionHeader } from './section-header';

async function fetchSuggestions() {
  try {
    await connectToDatabase();
    const { userId } = await auth();
    if (userId) {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
      const productIds = new Set<string>();
      for (const o of orders as any[]) {
        for (const it of o.items || []) {
          if (it.productId) productIds.add(it.productId);
        }
      }
      if (productIds.size > 0) {
        const buyerProducts = await Product.find({
          _id: { $in: Array.from(productIds) },
          deletedAt: null,
        })
          .select('categoryId')
          .lean();
        const topCat = (buyerProducts as any[])[0]?.categoryId;
        if (topCat) {
          const docs = await Product.find({
            categoryId: topCat,
            _id: { $nin: Array.from(productIds) },
            deletedAt: null,
          })
            .sort({ featured: -1, createdAt: -1 })
            .limit(8)
            .lean();
          if (docs.length > 0) {
            return {
              title: 'Picked for your business',
              products: (docs as any[]).map((p) => serializeProduct(p)),
            };
          }
        }
      }
    }
    // Guest fallback
    const docs = await Product.find({ bestseller: true, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    const fallback =
      docs.length > 0
        ? docs
        : await Product.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean();
    return {
      title: 'Trending across DMartBrandon',
      products: (fallback as any[]).map((p) => serializeProduct(p)),
    };
  } catch {
    return null;
  }
}

export async function YouMightLike() {
  const data = await fetchSuggestions();
  if (!data || data.products.length === 0) return null;
  const pincode = await getPincode();

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Recommended" title={data.title} />
      <div className="product-grid">
        {data.products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            etaLabel={etaFor(pincode, p.leadTimeHours, p.deliveryEtaHours).label}
          />
        ))}
      </div>
    </section>
  );
}
