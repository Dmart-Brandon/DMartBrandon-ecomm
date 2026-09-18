'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/storefront/product-card';
import { CardSkeleton } from '@/components/storefront/skeletons';
import { FilterSidebar, FilterState } from '@/components/filter-sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import type { EcommProduct, EcommCategory } from '@/lib/types';

type SortOption = 'newest' | 'price-low' | 'price-high';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const featuredParam = searchParams.get('featured');
  const newArrivalParam = searchParams.get('newArrival');
  const queryText = searchParams.get('q')?.trim() ?? '';

  const [products, setProducts] = useState<EcommProduct[]>([]);
  const [categories, setCategories] = useState<EcommCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    categories: categoryParam ? [categoryParam] : [],
    priceRange: [0, 0],
    colors: [],
    inStock: false,
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        if (Array.isArray(prods)) setProducts(prods);
        if (Array.isArray(cats)) setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setFilters((f) => ({ ...f, categories: [categoryParam] }));
    } else {
      setFilters((f) => ({ ...f, categories: [] }));
    }
  }, [categoryParam]);

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  useEffect(() => {
    if (priceBounds.max > 0) {
      setFilters((f) => ({ ...f, priceRange: [priceBounds.min, priceBounds.max] }));
    }
  }, [priceBounds.min, priceBounds.max]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    const hasCategoryFilter = filters.categories.length > 0;
    const hasPriceFilter =
      priceBounds.max > 0 &&
      (filters.priceRange[0] > priceBounds.min ||
        filters.priceRange[1] < priceBounds.max);
    const hasStockFilter = filters.inStock;
    const hasUserDrivenFilters =
      hasCategoryFilter || hasPriceFilter || hasStockFilter;

    if (filters.categories.length > 0) {
      const categoryIds = filters.categories
        .map((slug) => categories.find((c) => c.slug === slug)?.id)
        .filter(Boolean);
      filtered = filtered.filter((p) => categoryIds.includes(p.categoryId));
    }

    // If user changes filters, prioritize showing matching data over
    // preserving landing-page collection constraints like featured/newArrival.
    if (featuredParam === 'true' && !hasUserDrivenFilters) {
      filtered = filtered.filter((p) => p.featured);
    }
    if (newArrivalParam === 'true' && !hasUserDrivenFilters) {
      filtered = filtered.filter((p) => p.newArrival);
    }
    if (queryText) {
      const q = queryText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false)
      );
    }

    if (priceBounds.max > 0) {
      filtered = filtered.filter(
        (p) =>
          p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [
    products,
    categories,
    filters,
    sortBy,
    priceBounds.max,
    featuredParam,
    newArrivalParam,
    queryText,
  ]);

  const activeCategory = categoryParam
    ? categories.find((c) => c.slug === categoryParam)
    : null;

  return (
    <>
      <div className="border-b border-border/60 bg-gradient-to-b from-[#f4faf6] to-[#f9fcfa]">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {queryText ? 'Search results' : 'Browse'}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]">
            {queryText
              ? `Results for "${queryText}"`
              : activeCategory
              ? activeCategory.name
              : featuredParam === 'true'
              ? "Today's deals"
              : newArrivalParam === 'true'
              ? 'New arrivals'
              : 'All products'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground lg:text-[15px]">
            {loading
              ? 'Loading products…'
              : activeCategory
              ? activeCategory.description
              : 'Bulk-priced for businesses, GST-invoiced, delivered fast.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 rounded-lg lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md">
              <div className="py-6">
                <FilterSidebar
                  categories={categories}
                  onFilterChange={setFilters}
                  priceMin={priceBounds.min}
                  priceMax={priceBounds.max}
                  value={filters}
                  selectedCategories={filters.categories}
                  autoApply={false}
                  onApply={() => setMobileFiltersOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-2 bg-transparent px-1 py-1">
            <label htmlFor="sort" className="text-xs font-medium text-muted-foreground">
              Sort
            </label>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="h-7 w-[120px] border-0 bg-transparent px-1 text-xs shadow-none ring-0 focus:ring-0 sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-6">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <FilterSidebar
                categories={categories}
                onFilterChange={setFilters}
                priceMin={priceBounds.min}
                priceMax={priceBounds.max}
                value={filters}
                selectedCategories={filters.categories}
              />
            </div>
          </aside>

          <div className="rounded-2xl border border-border/50 bg-white p-3 shadow-[0_10px_36px_-30px_rgba(15,23,42,0.55)] lg:h-[calc(100vh-12.5rem)] lg:overflow-y-auto lg:scrollbar-none lg:border-border/60 lg:p-4">
            {loading ? (
              <div className="product-grid">
                {[...Array(10)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <h3 className="mb-2 font-display text-xl font-semibold">
                  Nothing matches those filters
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Try widening your selection.
                </p>
                <Button
                  size="sm"
                  onClick={() =>
                    setFilters({
                      categories: [],
                      priceRange: [priceBounds.min, priceBounds.max],
                      colors: [],
                      inStock: false,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function ProductsListClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="product-grid">
            {[...Array(10)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
