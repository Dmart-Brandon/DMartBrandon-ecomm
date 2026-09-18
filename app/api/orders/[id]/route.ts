import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const order = await Order.findOne({ _id: params.id, deletedAt: null }).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const o = order as any;

    // Ensure the order belongs to this user
    if (o.userId && o.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = {
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      userId: o.userId || '',
      total: o.total,
      status: o.status,
      notes: o.notes || '',
      items: (o.items || []).map((item: any) => ({
        id: item._id?.toString(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit || 'piece',
        image: item.image || '',
        hsnCode: item.hsnCode || '',
        selectedColor: item.selectedColor || '',
        selectedSize: item.selectedSize || '',
      })),
      shippingAddress: o.shippingAddress,
      trackingUrl: o.trackingUrl || '',
      gstin: o.gstin || '',
      businessName: o.businessName || '',
      taxBreakdown: o.taxBreakdown || undefined,
      createdAt: o.createdAt?.toISOString(),
      updatedAt: o.updatedAt?.toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/orders/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
