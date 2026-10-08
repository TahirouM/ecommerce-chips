"use client";

import { useSyncExternalStore } from "react";
import { availableStock } from "./backend/inventory";
import { addItem, type CartItem, parseCart, removeItem, setItemQuantity, summarize } from "./cart-state";

export type { CartItem, CartLine } from "./cart-state";

/** Store du panier : persistance localStorage + synchronisation entre onglets. */

const KEY = "craak-cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let items: CartItem[] | null = null;

function read(): CartItem[] {
  return (items ??= parseCart(localStorage.getItem(KEY)));
}

function write(next: CartItem[]) {
  if (next === items) return;
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

export const cart = {
  add(slug: string, quantity = 1) {
    write(addItem(read(), slug, quantity, (s) => availableStock(s)));
  },
  setQuantity(slug: string, quantity: number) {
    write(setItemQuantity(read(), slug, quantity, (s) => availableStock(s)));
  },
  remove(slug: string) {
    write(removeItem(read(), slug));
  },
  clear() {
    write([]);
  },
  quantityOf(slug: string) {
    return read().find((i) => i.slug === slug)?.quantity ?? 0;
  },
};

export function useCart() {
  return summarize(useSyncExternalStore(subscribe, read, () => EMPTY));
}

/* Code promo saisi dans le panier : simple préférence du client, revalidée par le backend. */

const PROMO_KEY = "craak-promo";
const promoListeners = new Set<() => void>();

function readPromo() {
  try {
    return localStorage.getItem(PROMO_KEY);
  } catch {
    return null;
  }
}

export function setPromoCode(code: string | null) {
  try {
    if (code) localStorage.setItem(PROMO_KEY, code);
    else localStorage.removeItem(PROMO_KEY);
  } catch {}
  promoListeners.forEach((l) => l());
}

export function usePromoCode() {
  return useSyncExternalStore(
    (l) => {
      promoListeners.add(l);
      return () => promoListeners.delete(l);
    },
    readPromo,
    () => null,
  );
}
