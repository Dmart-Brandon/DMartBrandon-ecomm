import {
  FileText,
  Tag,
  Truck,
  ShieldCheck,
  Undo2,
  Headphones,
} from 'lucide-react';

const ITEMS = [
  { icon: FileText, label: 'GST invoice on request' },
  { icon: Tag, label: 'Bulk pricing automatic' },
  { icon: Truck, label: 'Same-day delivery in Hyderabad' },
  { icon: ShieldCheck, label: 'Verified suppliers' },
  { icon: Undo2, label: 'Easy returns' },
  { icon: Headphones, label: '24×7 business support' },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border/60 bg-secondary/30">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 md:grid-cols-6 lg:px-8">
        {ITEMS.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm">
              <it.icon className="h-4 w-4" />
            </span>
            <p className="text-xs font-medium text-foreground/80">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
