"use client";

import { useSyncExternalStore } from "react";
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
    write(addItem(read(), slug, quantity));
  },
  setQuantity(slug: string, quantity: number) {
    write(setItemQuantity(read(), slug, quantity));
  },
  remove(slug: string) {
    write(removeItem(read(), slug));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  return summarize(useSyncExternalStore(subscribe, read, () => EMPTY));
}
