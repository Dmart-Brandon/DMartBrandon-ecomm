import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedList } from '@/lib/models/SavedList';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const lists = await SavedList.find({ userId }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json(
      (lists as any[]).map((l) => ({
        id: l._id.toString(),
        userId: l.userId,
        name: l.name,
        items: l.items ?? [],
        createdAt: l.createdAt?.toISOString(),
        updatedAt: l.updatedAt?.toISOString(),
      }))
    );
  } catch (err: any) {
    console.error('[GET /api/saved-lists]', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to load lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    await connectToDatabase();
    const doc = await SavedList.create({
      userId,
      name: name.slice(0, 60),
      items: Array.isArray(body.items) ? body.items : [],
    });
    return NextResponse.json(doc.toJSON(), { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/saved-lists]', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to create list' },
      { status: 500 }
    );
  }
}
