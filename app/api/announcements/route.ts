import { NextResponse } from 'next/server';
import { getActiveAnnouncements } from '@/lib/cms';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const messages = await getActiveAnnouncements();
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json([]);
  }
}
