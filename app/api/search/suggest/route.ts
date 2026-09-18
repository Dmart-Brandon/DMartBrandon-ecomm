import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';
import { Category } from '@/lib/models/Category';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    if (q.length < 2) {
      return NextResponse.json({ products: [], categories: [] });
    }

    await connectToDatabase();

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const [productDocs, categoryDocs] = await Promise.all([
      Product.find({
        deletedAt: null,
        $or: [{ name: regex }, { brand: regex }, { categoryName: regex }],
      })
        .select('name slug price unit images categoryName')
        .limit(8)
        .lean(),
      Category.find({ deletedAt: null, $or: [{ name: regex }, { description: regex }] })
        .select('name slug imageUrl')
        .limit(4)
        .lean(),
    ]);

    return NextResponse.json({
      products: (productDocs as any[]).map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        price: p.price,
        unit: p.unit,
        image: p.images?.[0] ?? '',
        categoryName: p.categoryName ?? '',
      })),
      categories: (categoryDocs as any[]).map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl ?? '',
      })),
    });
  } catch (err) {
    console.error('GET /api/search/suggest error:', err);
    return NextResponse.json({ products: [], categories: [] });
  }
}
