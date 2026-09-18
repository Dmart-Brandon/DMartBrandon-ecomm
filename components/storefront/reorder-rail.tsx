import Link from 'next/link';
import Image from 'next/image';
import { Repeat } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { SectionHeader } from './section-header';
import { ReorderTile } from './reorder-tile';

type ReorderItem = {
  productId: string;
  productName: string;
  image: string;
  unit: string;
  price: number;
  lastQty: number;
};

async function fetchRecentBuys(): Promise<ReorderItem[]> {
  try {
    const { userId } = await auth();
    if (!userId) return [];
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;

    await connectToDatabase();
    const orders = await Order.find({
      $or: [{ userId }, { customerEmail: email }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    if (!orders.length) return [];

    const map = new Map<string, ReorderItem>();
    for (const o of orders as any[]) {
      for (const it of o.items || []) {
        if (!it.productId) continue;
        if (!map.has(it.productId)) {
          map.set(it.productId, {
            productId: it.productId,
            productName: it.productName,
            image: it.image || '',
            unit: it.unit || 'piece',
            price: it.price,
            lastQty: it.quantity,
          });
        }
      }
      if (map.size >= 12) break;
    }
    return Array.from(map.values()).slice(0, 12);
  } catch (err) {
    console.error('reorder rail fetch error', err);
    return [];
  }
}

export async function ReorderRail() {
  const items = await fetchRecentBuys();
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Returning buyer"
        title="Reorder from your past orders"
        subtitle="One-tap restock for items you buy often"
        viewAllHref="/orders"
        viewAllLabel="All orders"
      />
      <div className="-mx-4 overflow-x-auto scrollbar-none px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid snap-x snap-mandatory scroll-smooth grid-flow-col auto-cols-[80%] gap-3 sm:auto-cols-[45%] md:auto-cols-[30%] lg:auto-cols-[22%]">
          {items.map((it) => (
            <div key={it.productId} className="snap-start">
              <ReorderTile item={it} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
