import Link from 'next/link';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All categories', href: '/products' },
      { label: "Today's deals", href: '/products?featured=true' },
      { label: 'New arrivals', href: '/products?newArrival=true' },
      { label: 'Bulk pricing', href: '/products' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Track order', href: '/orders' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background lg:mt-6">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr_repeat(2,1fr)] lg:gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="DMartBrandon home">
              <Image
                src="/DMartBrandon_logo.png"
                alt="DMartBrandon"
                width={160}
                height={64}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground lg:max-w-sm lg:text-[15px]">
              India&apos;s B2B marketplace for kiranas, restaurants, hotels, PGs and
              caterers. Vegetables, fruits, dairy, cakes &amp; electronics.
              Powered by DMartBrandon.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="https://www.instagram.com/dmartbrandon_solutions"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DMartBrandon on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 lg:mt-12 lg:pt-7">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DMartBrandon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
