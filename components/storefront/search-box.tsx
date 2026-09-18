'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface Suggestion {
  products: { id: string; name: string; slug: string; price: number; unit: string; image: string; categoryName: string }[];
  categories: { id: string; name: string; slug: string }[];
}

export function SearchBox({
  className,
  formClassName,
  placeholder = 'Search products, brands, categories…',
  animatedPlaceholders,
  animatedQuoteTerms,
}: {
  className?: string;
  formClassName?: string;
  placeholder?: string;
  animatedPlaceholders?: string[];
  animatedQuoteTerms?: string[];
} = {}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Suggestion>({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Outside-click closer
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const fetchSuggest = useCallback(async (text: string) => {
    if (text.length < 2) {
      setData({ products: [], categories: [] });
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search/suggest?q=${encodeURIComponent(text)}`,
        { signal: ctrl.signal }
      );
      if (res.ok) {
        const json = (await res.json()) as Suggestion;
        setData(json);
      }
    } catch {
      // aborted or error — ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggest(q), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, fetchSuggest]);

  useEffect(() => {
    const sequence = animatedQuoteTerms ?? animatedPlaceholders;
    if (!sequence || sequence.length <= 1) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % sequence.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [animatedPlaceholders, animatedQuoteTerms]);

  const activePlaceholder =
    animatedPlaceholders && animatedPlaceholders.length > 0
      ? animatedPlaceholders[placeholderIndex % animatedPlaceholders.length]
      : placeholder;
  const showAnimatedPlaceholder =
    ((!!animatedPlaceholders && animatedPlaceholders.length > 0) ||
      (!!animatedQuoteTerms && animatedQuoteTerms.length > 0)) &&
    q.length === 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div ref={containerRef} className={className ?? 'relative w-full'}>
      <form
        onSubmit={submit}
        className={
          formClassName ??
          'relative flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-border bg-background shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
        }
      >
        {showAnimatedPlaceholder && (
          <div className="pointer-events-none absolute inset-y-0 left-3 right-12 flex items-center text-sm text-muted-foreground">
            {animatedQuoteTerms && animatedQuoteTerms.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="shrink-0">Search</span>
                <span className="relative inline-block h-5 min-w-[10.5rem] overflow-hidden">
                  <span
                    key={placeholderIndex}
                    className="search-quote-in absolute left-0 top-0 block h-5 whitespace-nowrap leading-5"
                  >
                    {animatedQuoteTerms[placeholderIndex]}
                  </span>
                </span>
              </div>
            ) : (
              <div className="h-5 min-w-[10.5rem] overflow-hidden">
                <span
                  key={placeholderIndex}
                  className="search-quote-in block h-5 leading-5"
                >
                  {(animatedPlaceholders ?? [])[placeholderIndex]}
                </span>
              </div>
            )}
          </div>
        )}
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={showAnimatedPlaceholder ? '' : activePlaceholder}
          className="h-full flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search products"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQ('');
              setData({ products: [], categories: [] });
            }}
            className="px-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className="flex h-full w-12 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {open && q.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[420px] overflow-auto rounded-lg border border-border bg-popover p-2 shadow-lg">
          {loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Searching…
            </div>
          )}
          {!loading && data.products.length === 0 && data.categories.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No matches for &ldquo;{q}&rdquo;
            </div>
          )}
          {data.categories.length > 0 && (
            <div className="mb-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </div>
              <ul>
                {data.categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?category=${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.products.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Products
              </div>
              <ul>
                {data.products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary"
                    >
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-secondary">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {p.categoryName}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        ₹{p.price}
                        <span className="ml-0.5 text-[10px] text-muted-foreground">/{p.unit}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
