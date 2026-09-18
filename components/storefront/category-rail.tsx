import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/lib/models/Category';
import { Product } from '@/lib/models/Product';
import { serializeProduct } from '@/lib/serialize';
import { etaFor, getPincode } from '@/lib/pincode';
import { ProductCard } from './product-card';
import { SectionHeader } from './section-header';

interface Props {
  categorySlug: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  limit?: number;
}

async function fetchRail(categorySlug: string, limit: number) {
  try {
    await connectToDatabase();
    const cat = await Category.findOne({ slug: categorySlug }).lean();
    if (!cat) return null;
    const docs = await Product.find({ categoryId: (cat as any)._id.toString(), deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return {
      categoryName: (cat as any).name,
      products: (docs as any[]).map((p) => serializeProduct(p)),
    };
  } catch {
    return null;
  }
}

export async function CategoryRail({
  categorySlug,
  title,
  eyebrow,
  subtitle,
  limit = 10,
}: Props) {
  const data = await fetchRail(categorySlug, limit);
  if (!data || data.products.length === 0) return null;
  const pincode = await getPincode();

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        viewAllHref={`/products?category=${categorySlug}`}
      />
      <div className="-mx-4 overflow-x-auto scrollbar-none px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid snap-x snap-mandatory scroll-smooth grid-flow-col auto-cols-[42%] gap-2 sm:auto-cols-[38%] md:auto-cols-[30%] lg:auto-cols-[19%] lg:gap-3 xl:auto-cols-[16.4%]">
          {data.products.map((p) => (
            <div key={p.id} className="snap-start">
              <ProductCard
                product={p}
                etaLabel={etaFor(pincode, p.leadTimeHours, p.deliveryEtaHours).label}
                sizes="(max-width: 640px) 60vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 17vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
