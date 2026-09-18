'use client';

import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { EcommCategory } from '@/lib/types';

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  inStock: boolean;
}

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  categories?: EcommCategory[];
  priceMin: number;
  priceMax: number;
  selectedCategories?: string[];
  value?: FilterState;
  autoApply?: boolean;
  onApply?: () => void;
}

export function FilterSidebar({
  onFilterChange,
  categories = [],
  priceMin,
  priceMax,
  selectedCategories = [],
  value,
  autoApply = true,
  onApply,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: selectedCategories,
    priceRange: [priceMin, priceMax],
    colors: [],
    inStock: false,
  });

  useEffect(() => {
    if (value) {
      setFilters(value);
    }
  }, [value]);

  useEffect(() => {
    setFilters((f) => ({ ...f, priceRange: [priceMin, priceMax] }));
  }, [priceMin, priceMax]);

  useEffect(() => {
    setFilters((f) => ({ ...f, categories: selectedCategories }));
  }, [selectedCategories]);

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categorySlug]
      : filters.categories.filter((id) => id !== categorySlug);
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    if (autoApply) onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      priceRange: [value[0], value[1]] as [number, number],
    };
    setFilters(newFilters);
    if (autoApply) onFilterChange(newFilters);
  };

  const handleStockChange = (checked: boolean) => {
    const newFilters = { ...filters, inStock: checked };
    setFilters(newFilters);
    if (autoApply) onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      categories: [],
      priceRange: [priceMin, priceMax],
      colors: [],
      inStock: false,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
    onApply?.();
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-white p-5 lg:max-h-[calc(100vh-10rem)] lg:overflow-hidden lg:rounded-2xl lg:shadow-[0_14px_30px_-26px_rgba(15,23,42,0.5)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold lg:text-lg">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary lg:text-xs"
        >
          Reset
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={['category', 'price', 'availability']}
        className="w-full lg:overflow-y-auto lg:scrollbar-none"
      >
        {categories.length > 0 && (
          <AccordionItem value="category">
            <AccordionTrigger className="text-sm font-semibold lg:text-[13px]">Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2.5 lg:max-h-72 lg:overflow-y-auto lg:pr-1 lg:scrollbar-none">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 rounded-md px-1 py-0.5 hover:bg-secondary/70">
                    <Checkbox
                      id={category.slug}
                      checked={filters.categories.includes(category.slug)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.slug, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={category.slug}
                      className="cursor-pointer text-sm font-normal lg:text-[13px]"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold lg:text-[13px]">Price range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={priceMin}
                max={priceMax > priceMin ? priceMax : priceMin + 1}
                step={10}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground lg:text-[13px]">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-b-0">
          <AccordionTrigger className="text-sm font-semibold lg:text-[13px]">Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={handleStockChange}
              />
              <Label
                htmlFor="in-stock"
                className="cursor-pointer text-sm font-normal lg:text-[13px]"
              >
                In stock only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {!autoApply && (
        <div className="sticky bottom-0 -mx-5 mt-3 border-t border-border/60 bg-card px-5 pb-2 pt-3">
          <Button
            onClick={handleApply}
            className="h-11 w-full rounded-xl bg-[#318616] text-base font-semibold text-white hover:bg-[#2a7012]"
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}
