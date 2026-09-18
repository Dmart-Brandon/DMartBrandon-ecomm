'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SearchBox } from './search-box';

type CategoryTab = { slug: string; name: string };

function CategoryTabsSkeleton() {
  return (
    <div className="-mx-1 mt-2 flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="h-7 w-16 shrink-0 animate-pulse rounded-full bg-[#f0e6bc]/60"
        />
      ))}
    </div>
  );
}

function MobileCategoryTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const [categories, setCategories] = useState<CategoryTab[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(
            data.map((c: { slug: string; name: string }) => ({
              slug: c.slug,
              name: c.name,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const isProductsPage = pathname === '/products';
  const allActive = isProductsPage && !activeCategory;

  return (
    <div className="-mx-1 mt-2 flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
      <Link
        href="/products"
        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
          allActive
            ? 'bg-white text-foreground shadow-sm ring-1 ring-[#f0e6bc]'
            : 'text-foreground/70'
        }`}
      >
        All
      </Link>
      {categories.map((c) => {
        const isActive = isProductsPage && activeCategory === c.slug;
        return (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              isActive
                ? 'bg-white text-foreground shadow-sm ring-1 ring-[#f0e6bc]'
                : 'text-foreground/70'
            }`}
          >
            {c.name}
          </Link>
        );
      })}
    </div>
  );
}

export function MobileStoreHeader() {
  return (
    <div className="border-b border-border/40 bg-gradient-to-b from-[#fff8e1] to-[#fffdf5] pt-1.5 lg:hidden">
      <div className="mx-auto max-w-[1440px] px-3 pb-3">
        <SearchBox
          className="relative w-full"
          formClassName="flex h-10 w-full items-stretch overflow-hidden rounded-xl border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-[#318616]/25"
          placeholder='Search "fresh vegetables"'
          animatedQuoteTerms={[
            '"fresh vegetables"',
            '"fresh fruits"',
            '"fresh electronics"',
            '"fresh dairy"',
          ]}
        />

        <Suspense fallback={<CategoryTabsSkeleton />}>
          <MobileCategoryTabs />
        </Suspense>
      </div>
    </div>
  );
}
