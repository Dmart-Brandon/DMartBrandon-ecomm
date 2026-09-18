import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/lib/models/Category';
import { Product } from '@/lib/models/Product';
import { SectionHeader } from './section-header';

async function getCategoryCards() {
  try {
    await connectToDatabase();
    const cats = await Category.find({ deletedAt: null }).sort({ name: 1 }).lean();
    const startingPrices: Record<string, number> = {};
    await Promise.all(
      (cats as any[]).map(async (c) => {
        const cheapest = await Product.findOne({ categoryId: c._id.toString(), deletedAt: null })
          .sort({ price: 1 })
          .select('price unit')
          .lean();
        if (cheapest) {
          startingPrices[c.slug] = (cheapest as any).price;
        }
      })
    );
    return (cats as any[])
      .filter((c) => startingPrices[c.slug] != null)
      .map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl || '',
        startingFrom: startingPrices[c.slug],
      }));
  } catch {
    return [];
  }
}

export async function CategoryCards() {
  const items = await getCategoryCards();
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Shop by category"
        title="Popular categories"
      />
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-3 xl:grid-cols-6">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            prefetch
            className="group flex flex-col items-center gap-1.5 lg:block lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border/60 lg:bg-card lg:transition-all lg:hover:-translate-y-0.5 lg:hover:border-primary/40 lg:hover:shadow-md"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#e8f5f0] lg:aspect-[1.35/1] lg:rounded-t-2xl lg:rounded-b-none lg:bg-secondary">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105 lg:object-cover lg:p-0"
                  sizes="(max-width: 1023px) 22vw, 20vw"
                  aria-hidden
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                  <span className="text-2xl font-bold text-primary/40 lg:text-3xl">{c.name[0]}</span>
                </div>
              )}
            </div>
            <div className="w-full text-center lg:flex lg:items-end lg:justify-between lg:gap-2 lg:p-2.5 lg:text-left">
              <div>
                <p className="line-clamp-2 text-[10px] font-bold leading-tight text-foreground sm:text-xs lg:text-[13px]">
                  {c.name}
                </p>
                {c.startingFrom !== undefined && (
                  <p className="mt-0.5 hidden text-xs text-muted-foreground tabular-nums lg:block">
                    From ₹{c.startingFrom}
                  </p>
                )}
              </div>
              <ArrowRight className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary lg:block" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
