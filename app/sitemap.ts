import type { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dmartbrandon.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/cart`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const products = await Product.find({ stock: { $gt: 0 }, deletedAt: null }, { slug: 1, updatedAt: 1 })
      .lean<{ slug: string; updatedAt?: Date }[]>();
    productEntries = products
      .filter((p) => Boolean(p.slug))
      .map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt ?? now,
        changeFrequency: 'daily',
        priority: 0.7,
      }));
  } catch {
    productEntries = [];
  }

  return [...staticEntries, ...productEntries];
}
