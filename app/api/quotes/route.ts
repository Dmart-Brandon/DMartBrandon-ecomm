import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import { QuoteRequest } from '@/lib/models/QuoteRequest';

export const dynamic = 'force-dynamic';

const itemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string(),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  unit: z.string().optional(),
});

const bodySchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  businessName: z.string().min(1),
  gstin: z.string().optional(),
  items: z.array(itemSchema).max(100).default([]),
  cartTotal: z.number().nonnegative().default(0),
  expectedFrequency: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const quotes = await QuoteRequest.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    const serialized = quotes.map((q: any) => ({
      ...q,
      id: q._id.toString(),
      _id: undefined,
    }));
    return NextResponse.json(serialized);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const { userId } = await auth();
    await connectToDatabase();
    const doc = await QuoteRequest.create({
      userId: userId || '',
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || '',
      businessName: data.businessName || '',
      gstin: (data.gstin || '').trim().toUpperCase(),
      items: data.items,
      cartTotal: data.cartTotal,
      expectedFrequency: data.expectedFrequency || '',
      notes: data.notes || '',
      status: 'new',
    });
    return NextResponse.json(
      {
        id: doc._id.toString(),
        status: 'new',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[POST /api/quotes]', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to submit quote' },
      { status: 500 }
    );
  }
}
