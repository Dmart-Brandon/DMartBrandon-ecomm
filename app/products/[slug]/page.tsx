import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';
import { Review } from '@/lib/models/Review';
import { type EcommReview } from '@/lib/types';
import { serializeProduct } from '@/lib/serialize';
import { RecordRecentlyViewed } from '@/components/storefront/record-recently-viewed';
import { ProductPageClient } from './product-page-client';

export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dmartbrandon.com';

function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  await connectToDatabase();
  const doc = await Product.findOne({ slug: params.slug, deletedAt: null }).lean<any>();
  if (!doc) {
    return { title: 'Product not found · DMartBrandon' };
  }

  const name: string = doc.name;
  const categoryName: string = doc.categoryName || 'Wholesale';
  const rawDescription: string = doc.description || '';
  const description = rawDescription
    ? truncate(rawDescription)
    : truncate(
        `Buy ${name} wholesale on DMartBrandon. Tiered B2B pricing, GST invoices, cold-chain delivery in Hyderabad.`,
      );
  const title = `${name} — Wholesale ${categoryName}`;
  const canonical = `/products/${doc.slug}`;
  const inStock = (doc.stock ?? 0) > 0;
  const images: string[] = Array.isArray(doc.images) ? doc.images : [];
  const ogImage = images[0] ?? '/DMartBrandon_logo.png';

  return {
    title,
    description,
    alternates: { canonical },
    robots: inStock
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: 'website',
      title: `${title} · DMartBrandon`,
      description,
      url: `${SITE_URL}${canonical}`,
      images: [{ url: ogImage, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · DMartBrandon`,
      description,
      images: [ogImage],
    },
  };
}

function toEcommReview(doc: any): EcommReview {
  return {
    id: doc._id.toString(),
    productId: doc.productId,
    userId: doc.userId || '',
    userName: doc.userName,
    userEmail: doc.userEmail,
    rating: doc.rating,
    title: doc.title || '',
    comment: doc.comment || '',
    verifiedPurchase: doc.verifiedPurchase || false,
    helpfulCount: doc.helpfulCount || 0,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt ?? ''),
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  await connectToDatabase();

  const productDoc = await Product.findOne({ slug: params.slug, deletedAt: null }).lean();
  if (!productDoc) {
    notFound();
  }

  const product = serializeProduct(productDoc);

  const [relatedDocs, reviewDocs] = await Promise.all([
    Product.find({ categoryId: product.categoryId, _id: { $ne: product.id }, deletedAt: null })
      .limit(4)
      .lean(),
    Review.find({ productId: product.id }).sort({ createdAt: -1 }).lean(),
  ]);

  const relatedProducts = (relatedDocs as any[]).map((d) => serializeProduct(d));
  const initialReviews = (reviewDocs as any[]).map(toEcommReview);

  const reviewCount = initialReviews.length;
  const avgRating =
    reviewCount > 0
      ? initialReviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;
  product.rating = Math.round(avgRating * 10) / 10;
  product.reviewCount = reviewCount;

  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const basePrice = product.priceTiers?.[0]?.price ?? product.price;
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Buy ${product.name} wholesale on DMartBrandon.`,
    image: product.images?.length ? product.images : [`${SITE_URL}/DMartBrandon_logo.png`],
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand || 'DMartBrandon' },
    category: product.categoryName,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: basePrice,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'DMartBrandon' },
    },
  };
  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount,
    };
    jsonLd.review = initialReviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating },
      author: { '@type': 'Person', name: r.userName || 'Verified buyer' },
      datePublished: r.createdAt,
      name: r.title || undefined,
      reviewBody: r.comment || undefined,
    }));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecordRecentlyViewed
        item={{
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images[0] ?? '',
          unit: product.unit,
        }}
      />
      <ProductPageClient
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={initialReviews}
      />
    </>
  );
}
