import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedList } from '@/lib/models/SavedList';
import { Product } from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    if (!body.productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }
    await connectToDatabase();
    const doc = await SavedList.findOne({ _id: params.id, userId });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const exists = (doc.items ?? []).some(
      (i: any) => i.productId === body.productId
    );
    if (exists) {
      return NextResponse.json(doc.toJSON());
    }
    const product = await Product.findById(body.productId).lean<any>();
    if (product && product.stock != null && product.stock <= 0) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 },
      );
    }
    const moq = product?.moq ?? 1;
    const qty = Math.max(moq, Math.round(Number(body.qty) || moq));
    doc.items = [
      ...(doc.items ?? []),
      {
        productId: String(body.productId),
        productName: String(body.productName ?? ''),
        slug: String(body.slug ?? ''),
        image: String(body.image ?? ''),
        unit: String(body.unit ?? 'piece'),
        qty,
        price: Number(body.price) || 0,
      },
    ];
    await doc.save();
    return NextResponse.json(doc.toJSON());
  } catch (err: any) {
    console.error('[POST /api/saved-lists/[id]/items]', err);
    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: 500 }
    );
  }
}
