import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedList } from '@/lib/models/SavedList';

export const dynamic = 'force-dynamic';

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const doc = await SavedList.findOne({ _id: params.id, userId }).lean();
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const d = doc as any;
    return NextResponse.json({
      id: d._id.toString(),
      userId: d.userId,
      name: d.name,
      items: d.items ?? [],
      createdAt: d.createdAt?.toISOString(),
      updatedAt: d.updatedAt?.toISOString(),
    });
  } catch (err: any) {
    console.error('[GET /api/saved-lists/[id]]', err);
    return NextResponse.json(
      { error: 'Failed to load list' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      update.name = name.slice(0, 60);
    }
    if (Array.isArray(body.items)) {
      update.items = body.items;
    }
    await connectToDatabase();
    const doc = await SavedList.findOneAndUpdate(
      { _id: params.id, userId },
      { $set: update },
      { new: true }
    );
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc.toJSON());
  } catch (err: any) {
    console.error('[PUT /api/saved-lists/[id]]', err);
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const doc = await SavedList.findOneAndDelete({
      _id: params.id,
      userId,
    });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    );
  }
}
