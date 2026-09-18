import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { BusinessProfile } from '@/lib/models/BusinessProfile';
import { computeTax } from '@/lib/tax';
import { isValidGstin } from '@/lib/gst';

export const dynamic = 'force-dynamic';

const itemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  unit: z.string().optional(),
  image: z.string().optional(),
  hsnCode: z.string().optional(),
});

const taxBreakdownSchema = z
  .object({
    subtotal: z.number(),
    cgst: z.number(),
    sgst: z.number(),
    igst: z.number(),
    total: z.number(),
    rate: z.number(),
    isInterState: z.boolean(),
    sellerState: z.string(),
    buyerState: z.string(),
  })
  .optional();

const gstSchema = z
  .object({
    gstin: z.string(),
    businessName: z.string().optional(),
    saveToProfile: z.boolean().optional(),
    taxBreakdown: taxBreakdownSchema,
  })
  .nullable()
  .optional();

const bodySchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(3),
    country: z.string().min(2),
    notes: z.string().optional(),
  }),
  items: z.array(itemSchema).min(1),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().nonnegative(),
  gst: gstSchema,
});

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QRX-${stamp}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const orderNumber = generateOrderNumber();

    const { userId } = await auth();
    await connectToDatabase();

    // Recompute tax server-side to defend against tampering. We trust the
    // client only with the `gstin` choice; the math has to be authoritative.
    let taxBreakdown: ReturnType<typeof computeTax> | undefined;
    if (data.gst) {
      taxBreakdown = computeTax(
        data.items.map((it) => ({
          hsnCode: it.hsnCode,
          price: it.price,
          quantity: it.quantity,
        })),
        {
          buyerStateInput: data.customer.state,
          buyerGstin: data.gst.gstin,
        }
      );
    }

    const order = await Order.create({
      orderNumber,
      customerName: data.customer.name,
      customerEmail: data.customer.email,
      userId: userId || '',
      total: data.total,
      status: 'pending',
      paymentStatus: 'pending',
      notes: data.customer.notes || '',
      items: data.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        price: it.price,
        unit: it.unit || 'piece',
        image: it.image || '',
        hsnCode: it.hsnCode || '',
      })),
      shippingAddress: {
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        address: data.customer.address,
        city: data.customer.city,
        state: data.customer.state,
        zipCode: data.customer.zipCode,
        country: data.customer.country,
      },
      gstin: data.gst?.gstin?.trim().toUpperCase() ?? '',
      businessName: data.gst?.businessName?.trim() ?? '',
      taxBreakdown,
    });

    // Optionally save the GSTIN to the buyer's BusinessProfile for next time.
    if (
      userId &&
      data.gst?.saveToProfile &&
      data.gst?.gstin &&
      isValidGstin(data.gst.gstin)
    ) {
      try {
        const gstin = data.gst.gstin.trim().toUpperCase();
        const businessName = data.gst.businessName?.trim() ?? '';
        const existing = await BusinessProfile.findOne({ userId });
        if (!existing) {
          await BusinessProfile.create({
            userId,
            businessName,
            gstins: [{ gstin, label: '', isDefault: true }],
          });
        } else {
          const already = (existing.gstins ?? []).some(
            (g: any) => g.gstin === gstin
          );
          const updates: Record<string, unknown> = {};
          if (!existing.businessName && businessName) {
            updates.businessName = businessName;
          }
          if (!already) {
            await BusinessProfile.updateOne(
              { userId },
              {
                ...(Object.keys(updates).length > 0 ? { $set: updates } : {}),
                $push: {
                  gstins: {
                    gstin,
                    label: '',
                    isDefault: (existing.gstins ?? []).length === 0,
                  },
                },
              }
            );
          } else if (Object.keys(updates).length > 0) {
            await BusinessProfile.updateOne(
              { userId },
              { $set: updates }
            );
          }
        }
      } catch (err) {
        // Non-fatal — order already saved.
        console.error('[contact-order] Failed to save GSTIN to profile', err);
      }
    }

    return NextResponse.json({
      orderId: order._id.toString(),
      orderNumber,
    });
  } catch (err: any) {
    console.error('[POST /api/contact-order]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit order' },
      { status: 500 }
    );
  }
}
