'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { CartItem, PriceTier } from '@/lib/types';
import { activeTier } from '@/lib/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, silent?: boolean) => void;
  syncStock: (stockMap: Record<string, number>) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  totalSavings: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = 'dmartbrandon_cart';

function formatUnit(unit: string | undefined, qty: number): string {
  const u = unit || 'piece';
  if (qty === 1) return u;
  if (u.endsWith('s')) return u;
  return `${u}s`;
}

function applyTier(item: CartItem): CartItem {
  const original = item.originalPrice ?? item.price;
  const tiers = item.priceTiers as PriceTier[] | undefined;
  const tier = activeTier(item.quantity, tiers);
  if (tier) {
    return {
      ...item,
      originalPrice: original,
      price: tier.price,
      appliedTierPrice: tier.price,
      appliedTierMinQty: tier.minQty,
    };
  }
  return {
    ...item,
    originalPrice: original,
    price: original,
    appliedTierPrice: undefined,
    appliedTierMinQty: undefined,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(parsed.map(applyTier));
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // ignore
    }
  }, []);

  const addItem = useCallback((item: CartItem) => {
    const moq = Math.max(1, item.moq ?? 1);
    const stepSize = Math.max(1, item.stepSize ?? 1);
    const unit = item.unit || 'piece';
    const incoming: CartItem = {
      ...item,
      unit,
      moq,
      stepSize,
      originalPrice: item.originalPrice ?? item.price,
      quantity: Math.max(moq, item.quantity),
    };

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === incoming.productId);
      let updated: CartItem[];
      if (existing) {
        let merged = Math.max(existing.quantity + item.quantity, moq);
        const stock = incoming.stock ?? existing.stock;
        if (stock != null && merged > stock) {
          merged = stock;
          toast(`Only ${stock} ${formatUnit(unit, stock)} in stock`);
        }
        updated = prev.map((i) =>
          i.productId === incoming.productId
            ? applyTier({ ...i, quantity: merged, unit, moq, stepSize, stock })
            : i
        );
      } else {
        updated = [...prev, applyTier(incoming)];
      }
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, silent?: boolean) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const target = prev.find((i) => i.productId === productId);
      if (!target) return prev;
      const moq = Math.max(1, target.moq ?? 1);
      let nextQty = quantity;
      if (nextQty < moq) {
        nextQty = moq;
        if (!silent) toast(`Minimum order is ${moq} ${formatUnit(target.unit, moq)}`);
      }
      if (target.stock != null && nextQty > target.stock) {
        nextQty = target.stock;
        if (!silent) toast(`Only ${target.stock} ${formatUnit(target.unit, target.stock)} in stock`);
      }
      const updated = prev.map((i) =>
        i.productId === productId ? applyTier({ ...i, quantity: nextQty }) : i
      );
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const syncStock = useCallback((stockMap: Record<string, number>) => {
    setItems((prev) => {
      let changed = false;
      const updated = prev.map((item) => {
        const liveStock = stockMap[item.productId];
        if (liveStock == null) return item;
        let nextQty = item.quantity;
        if (liveStock <= 0) {
          if (item.stock !== 0) changed = true;
          return { ...item, stock: 0 };
        }
        if (nextQty > liveStock) {
          nextQty = liveStock;
          changed = true;
        }
        if (item.stock !== liveStock) changed = true;
        return changed || nextQty !== item.quantity
          ? applyTier({ ...item, stock: liveStock, quantity: nextQty })
          : { ...item, stock: liveStock };
      });
      if (!changed) return prev;
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalSavings = items.reduce((sum, i) => {
    const orig = i.originalPrice ?? i.price;
    return sum + Math.max(0, (orig - i.price) * i.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        syncStock,
        clearCart,
        itemCount,
        totalPrice,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
