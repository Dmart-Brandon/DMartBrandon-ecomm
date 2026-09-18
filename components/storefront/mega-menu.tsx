'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

const MEGA_DATA = [
  {
    name: 'Vegetables',
    slug: 'vegetables',
    image:
      'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=400',
    sub: ['Onions & Potatoes', 'Tomatoes', 'Leafy Greens', 'Capsicum & Peppers', 'Herbs', 'Exotic vegetables'],
  },
  {
    name: 'Fruits',
    slug: 'fruits',
    image:
      'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400',
    sub: ['Apples', 'Bananas', 'Mangoes', 'Citrus', 'Berries', 'Tropical'],
  },
  {
    name: 'Dairy',
    slug: 'dairy',
    image:
      'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400',
    sub: ['Milk & Cream', 'Butter & Ghee', 'Curd & Yogurt', 'Cheese', 'Paneer', 'Ice cream'],
  },
  {
    name: 'Cakes & Bakery',
    slug: 'cakes-bakery',
    image:
      'https://images.pexels.com/photos/264939/pexels-photo-264939.jpeg?auto=compress&cs=tinysrgb&w=400',
    sub: ['Cakes', 'Breads & Pav', 'Croissants', 'Brownies', 'Cookies', 'Custom orders'],
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    image:
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
    sub: ['Televisions', 'Office printers', 'Networking', 'Lighting', 'Kitchen appliances', 'Accessories'],
  },
];

export function MegaMenuTrigger() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function scheduleClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  }
  function cancelClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      className="relative hidden sm:block"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      >
        All Categories
        <ChevronDown
          aria-hidden="true"
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="fixed inset-x-0 top-[5.75rem] z-30 border-y border-border bg-background shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 md:top-[6.75rem]"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:px-8">
            {MEGA_DATA.map((c) => (
              <div key={c.slug}>
                <Link
                  href={`/products?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="group block"
                >
                  <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="200px"
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {c.name}
                  </p>
                </Link>
                <ul className="mt-1 space-y-0.5">
                  {c.sub.map((s) => (
                    <li key={s}>
                      <Link
                        href={`/products?category=${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="block py-0.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        {s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
