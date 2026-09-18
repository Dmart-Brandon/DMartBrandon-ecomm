import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { stateNameFromCode, gstinStateCode } from '@/lib/gst';
import { rateForLine } from '@/lib/tax';
import { InvoicePrintButton } from './invoice-print-button';

export const dynamic = 'force-dynamic';

const SELLER = {
  name: 'Niravana Software Services Pvt. Ltd.',
  address: 'Banjara Hills, Hyderabad, Telangana 500034',
  gstin: '36ABCDE1234F1Z5',
  state: 'Telangana',
  email: 'orders@dmartbrandon.com',
  phone: '+91 90000 00000',
};

function formatINR(n: number) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) notFound();

  await connectToDatabase();
  const order = await Order.findById(params.id).lean();
  if (!order) notFound();
  const o = order as any;
  if (o.userId && o.userId !== userId) notFound();

  const items = (o.items || []) as any[];
  const isGst = !!o.gstin && !!o.taxBreakdown;
  const buyerStateName = isGst
    ? stateNameFromCode(gstinStateCode(o.gstin))
    : o.shippingAddress?.state ?? '';

  // Per-line tax for printing.
  const linesWithTax = items.map((item) => {
    const net = item.price * item.quantity;
    const rate = rateForLine({
      hsnCode: item.hsnCode,
      price: item.price,
      quantity: item.quantity,
    });
    const gst = isGst ? (net * rate) / 100 : 0;
    return {
      ...item,
      net,
      rate,
      gst,
      gross: net + gst,
    };
  });

  const subtotal = linesWithTax.reduce((s, l) => s + l.net, 0);
  const totalGst = linesWithTax.reduce((s, l) => s + l.gst, 0);
  const breakdown = o.taxBreakdown ?? null;
  const grandTotal = isGst
    ? subtotal + totalGst
    : o.total ?? subtotal;

  return (
    <main className="min-h-screen bg-secondary/40 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl space-y-4 print:max-w-none">
        <div className="flex items-center justify-between print:hidden">
          <a
            href={`/orders/${params.id}`}
            className="text-sm text-primary hover:underline"
          >
            ← Back to order
          </a>
          <InvoicePrintButton />
        </div>

        <article className="rounded-2xl border border-border/60 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-6 print:shadow-none">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {isGst ? 'Tax invoice' : 'Retail invoice'}
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
                DMartBrandon
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Order ref{' '}
                <span className="font-mono font-semibold text-foreground">
                  {o.orderNumber}
                </span>
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="text-muted-foreground">Issued</p>
              <p className="font-semibold tabular-nums">
                {new Date(o.createdAt ?? Date.now()).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Parties */}
          <div className="mt-6 grid gap-6 border-b pb-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Seller
              </p>
              <p className="mt-1 text-sm font-semibold">{SELLER.name}</p>
              <p className="text-xs text-muted-foreground">{SELLER.address}</p>
              {isGst && (
                <p className="mt-1 text-xs">
                  <span className="text-muted-foreground">GSTIN: </span>
                  <span className="font-mono">{SELLER.gstin}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {SELLER.email} · {SELLER.phone}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Buyer
              </p>
              <p className="mt-1 text-sm font-semibold">
                {o.businessName || o.customerName}
              </p>
              {o.businessName && o.customerName && (
                <p className="text-xs text-muted-foreground">
                  {o.customerName}
                </p>
              )}
              {o.shippingAddress && (
                <p className="text-xs text-muted-foreground">
                  {o.shippingAddress.address}, {o.shippingAddress.city},{' '}
                  {o.shippingAddress.state} {o.shippingAddress.zipCode}
                </p>
              )}
              {isGst && (
                <p className="mt-1 text-xs">
                  <span className="text-muted-foreground">GSTIN: </span>
                  <span className="font-mono">{o.gstin}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {o.shippingAddress?.email ?? o.customerEmail}
                {o.shippingAddress?.phone && ` · ${o.shippingAddress.phone}`}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Item</th>
                  {isGst && <th className="py-2 pr-2">HSN</th>}
                  <th className="py-2 pr-2 text-right">Qty</th>
                  <th className="py-2 pr-2 text-right">Rate</th>
                  <th className="py-2 pr-2 text-right">Net</th>
                  {isGst && (
                    <>
                      <th className="py-2 pr-2 text-right">GST %</th>
                      <th className="py-2 pr-2 text-right">GST ₹</th>
                    </>
                  )}
                  <th className="py-2 pl-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {linesWithTax.map((line, i) => (
                  <tr key={line.productId || i} className="border-b">
                    <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 pr-2">
                      <p className="font-medium">{line.productName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {line.unit ?? 'piece'}
                      </p>
                    </td>
                    {isGst && (
                      <td className="py-2 pr-2 font-mono text-xs">
                        {line.hsnCode || '—'}
                      </td>
                    )}
                    <td className="py-2 pr-2 text-right">{line.quantity}</td>
                    <td className="py-2 pr-2 text-right">
                      {formatINR(line.price)}
                    </td>
                    <td className="py-2 pr-2 text-right">{formatINR(line.net)}</td>
                    {isGst && (
                      <>
                        <td className="py-2 pr-2 text-right">{line.rate}%</td>
                        <td className="py-2 pr-2 text-right">
                          {formatINR(line.gst)}
                        </td>
                      </>
                    )}
                    <td className="py-2 pl-2 text-right font-semibold">
                      {formatINR(line.gross)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm tabular-nums">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (net)</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {isGst && breakdown && (
              <>
                {breakdown.isInterState ? (
                  <div className="flex justify-between text-muted-foreground">
                    <span>IGST</span>
                    <span>{formatINR(breakdown.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST</span>
                      <span>{formatINR(breakdown.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>SGST</span>
                      <span>{formatINR(breakdown.sgst)}</span>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total payable</span>
              <span>{formatINR(grandTotal)}</span>
            </div>
            {isGst && breakdown && (
              <p className="pt-1 text-[11px] text-muted-foreground">
                {breakdown.isInterState
                  ? `Inter-state supply (${breakdown.sellerState} → ${
                      breakdown.buyerState || '?'
                    })`
                  : `Intra-state supply (${breakdown.sellerState})`}
                {buyerStateName && ` · ${buyerStateName}`}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 space-y-2 border-t pt-6 text-[11px] text-muted-foreground">
            {!isGst && (
              <p>
                This is a retail invoice. No input tax credit can be claimed
                against it. To get a GST invoice on your next order, save your
                GSTIN under your account&apos;s Business details.
              </p>
            )}
            {isGst && (
              <p>
                Whether the tax is payable on a reverse-charge basis: <strong>No</strong>.
                Computer-generated invoice; no signature required.
              </p>
            )}
            <p>
              Thank you for your business. For any clarification on this invoice,
              email {SELLER.email}.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
