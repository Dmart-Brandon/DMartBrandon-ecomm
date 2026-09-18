import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BusinessProfile } from '@/lib/models/BusinessProfile';
import { isValidGstin } from '@/lib/gst';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const doc = await BusinessProfile.findOne({ userId }).lean();
    if (!doc) {
      return NextResponse.json({
        userId,
        businessName: '',
        gstins: [],
      });
    }
    const d = doc as any;
    return NextResponse.json({
      id: d._id.toString(),
      userId: d.userId,
      businessName: d.businessName ?? '',
      gstins: d.gstins ?? [],
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  } catch (err: any) {
    console.error('[GET /api/business-profile]', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const businessName: string = String(body.businessName ?? '').trim();
    const incoming = Array.isArray(body.gstins) ? body.gstins : [];

    // Validate, normalise, dedupe, enforce single-default invariant.
    const cleaned: { gstin: string; label: string; isDefault: boolean }[] = [];
    const seen = new Set<string>();
    for (const entry of incoming) {
      if (!entry || typeof entry.gstin !== 'string') continue;
      const gstin = String(entry.gstin).trim().toUpperCase();
      if (!isValidGstin(gstin)) continue;
      if (seen.has(gstin)) continue;
      seen.add(gstin);
      cleaned.push({
        gstin,
        label: typeof entry.label === 'string' ? entry.label.trim() : '',
        isDefault: !!entry.isDefault,
      });
    }
    const defaults = cleaned.filter((g) => g.isDefault);
    if (defaults.length === 0 && cleaned.length > 0) {
      cleaned[0].isDefault = true;
    } else if (defaults.length > 1) {
      let kept = false;
      for (const g of cleaned) {
        if (g.isDefault) {
          if (kept) g.isDefault = false;
          else kept = true;
        }
      }
    }

    await connectToDatabase();
    const doc = await BusinessProfile.findOneAndUpdate(
      { userId },
      { $set: { userId, businessName, gstins: cleaned } },
      { new: true, upsert: true }
    );
    return NextResponse.json({
      id: doc._id.toString(),
      userId: doc.userId,
      businessName: doc.businessName ?? '',
      gstins: doc.gstins ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err: any) {
    console.error('[PUT /api/business-profile]', err);
    return NextResponse.json(
      { error: err.message ?? 'Failed to save profile' },
      { status: 500 }
    );
  }
}
