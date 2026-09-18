import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedList } from '@/lib/models/SavedList';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const qty = Math.max(1, Math.round(Number(body.qty) || 1));
    await connectToDatabase();
    const doc = await SavedList.findOneAndUpdate(
      { _id: params.id, userId, 'items.productId': params.productId },
      { $set: { 'items.$.qty': qty } },
      { new: true }
    );
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc.toJSON());
  } catch {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; productId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const doc = await SavedList.findOneAndUpdate(
      { _id: params.id, userId },
      { $pull: { items: { productId: params.productId } } },
      { new: true }
    );
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc.toJSON());
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
