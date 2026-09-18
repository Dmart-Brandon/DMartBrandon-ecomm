import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Review } from '@/lib/models/Review';
import { Order } from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();

    const result = (reviews as any[]).map((r) => ({
      id: r._id.toString(),
      productId: r.productId,
      userId: r.userId || '',
      userName: r.userName,
      userEmail: r.userEmail,
      rating: r.rating,
      title: r.title || '',
      comment: r.comment || '',
      verifiedPurchase: r.verifiedPurchase || false,
      helpfulCount: r.helpfulCount || 0,
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';
    const userName = clerkUser?.fullName || clerkUser?.firstName || 'Anonymous';

    await connectToDatabase();

    const body = await req.json();
    const { productId, rating, title, comment } = body;

    if (!productId || !rating) {
      return NextResponse.json({ error: 'productId and rating are required' }, { status: 400 });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ productId, userId });
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
    }

    // Check if verified purchase
    const order = await Order.findOne({
      userId,
      'items.productId': productId,
      status: { $in: ['processing', 'completed'] },
    });

    const review = await Review.create({
      productId,
      userId,
      userName,
      userEmail,
      rating,
      title: title || '',
      comment: comment || '',
      verifiedPurchase: !!order,
    });

    return NextResponse.json(review.toJSON(), { status: 201 });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
