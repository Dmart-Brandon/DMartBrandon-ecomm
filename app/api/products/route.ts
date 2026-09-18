import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';
import { Review } from '@/lib/models/Review';
import { serializeProduct } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const bestseller = searchParams.get('bestseller');
    const categoryId = searchParams.get('categoryId');
    const ids = searchParams.get('ids');
    const slugs = searchParams.get('slugs');
    const limit = Math.min(parseInt(searchParams.get('limit') || '0', 10) || 0, 50);

    const query: Record<string, unknown> = { deletedAt: null };
    if (featured === 'true') query.featured = true;
    if (newArrival === 'true') query.newArrival = true;
    if (bestseller === 'true') query.bestseller = true;
    if (categoryId) query.categoryId = categoryId;
    if (ids) {
      const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);
      if (idList.length > 0) query._id = { $in: idList };
    }
    if (slugs) {
      const slugList = slugs.split(',').map((s) => s.trim()).filter(Boolean);
      if (slugList.length > 0) query.slug = { $in: slugList };
    }

    let cursor = Product.find(query).sort({ createdAt: -1 });
    if (limit > 0) cursor = cursor.limit(limit);
    const products = await cursor.lean();

    const productIds = products.map((p: any) => p._id.toString());
    const reviewAggs = productIds.length
      ? await Review.aggregate([
          { $match: { productId: { $in: productIds } } },
          {
            $group: {
              _id: '$productId',
              avgRating: { $avg: '$rating' },
              count: { $sum: 1 },
            },
          },
        ])
      : [];
    const reviewMap: Record<string, { avg: number; count: number }> = {};
    for (const agg of reviewAggs) {
      reviewMap[agg._id] = { avg: agg.avgRating, count: agg.count };
    }

    const result = products.map((p: any) =>
      serializeProduct(p, reviewMap[p._id.toString()])
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/products error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
