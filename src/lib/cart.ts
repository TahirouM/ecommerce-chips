"use client";

import { useSyncExternalStore } from "react";
import { FREE_SHIPPING_THRESHOLD, getProduct, type Product } from "./products";

export type CartItem = { slug: string; quantity: number };
export type CartLine = CartItem & { product: Product; total: number };

const KEY = "craak-cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let items: CartItem[] | null = null;

function read(): CartItem[] {
  if (items) return items;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    items = Array.isArray(parsed) ? parsed.filter((i) => getProduct(i.slug)) : [];
  } catch {
    items = [];
  }
  return items!;
}

function write(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    items = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function clampQuantity(slug: string, quantity: number) {
  const stock = getProduct(slug)?.stock ?? 0;
  return Math.max(0, Math.min(quantity, stock));
}

export const cart = {
  add(slug: string, quantity = 1) {
    const current = read();
    const existing = current.find((i) => i.slug === slug);
    const qty = clampQuantity(slug, (existing?.quantity ?? 0) + quantity);
    if (qty === 0) return;
    write(
      existing
        ? current.map((i) => (i.slug === slug ? { ...i, quantity: qty } : i))
        : [...current, { slug, quantity: qty }],
    );
  },
  setQuantity(slug: string, quantity: number) {
    const qty = clampQuantity(slug, quantity);
    write(
      qty === 0
        ? read().filter((i) => i.slug !== slug)
        : read().map((i) => (i.slug === slug ? { ...i, quantity: qty } : i)),
    );
  },
  remove(slug: string) {
    write(read().filter((i) => i.slug !== slug));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  const lines: CartLine[] = raw.flatMap((item) => {
    const product = getProduct(item.slug);
    return product ? [{ ...item, product, total: product.price * item.quantity }] : [];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return {
    lines,
    count,
    subtotal,
    freeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
  };
}
