import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';

    const orders = await Order.find({
      deletedAt: null,
      $or: [{ userId }, { customerEmail: userEmail }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const result = (orders as any[]).map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      userId: o.userId || '',
      total: o.total,
      status: o.status,
      items: (o.items || []).map((item: any) => ({
        id: item._id?.toString(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit || 'piece',
        image: item.image || '',
        selectedColor: item.selectedColor || '',
        selectedSize: item.selectedSize || '',
      })),
      shippingAddress: o.shippingAddress,
      trackingUrl: o.trackingUrl || '',
      createdAt: o.createdAt?.toISOString(),
      updatedAt: o.updatedAt?.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { items, shippingAddress, total } = body;

    if (!items?.length || !shippingAddress || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    const order = await Order.create({
      orderNumber,
      customerName: shippingAddress.name,
      customerEmail: shippingAddress.email,
      userId,
      total,
      status: 'pending',
      items: items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit || 'piece',
        image: item.image || '',
        selectedColor: item.selectedColor || '',
        selectedSize: item.selectedSize || '',
      })),
      shippingAddress,
    });

    return NextResponse.json(order.toJSON(), { status: 201 });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
