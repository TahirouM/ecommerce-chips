import type { CartLine } from "./cart";

export type Order = {
  id: string;
  email: string;
  name: string;
  address: string;
  lines: { name: string; quantity: number; total: number }[];
  shipping: number;
  total: number;
};

const KEY = "craak-last-order";

export function saveOrder(order: Order) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {}
}

export function loadOrder(): Order | null {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

export function toOrderLines(lines: CartLine[]) {
  return lines.map((l) => ({ name: l.product.name, quantity: l.quantity, total: l.total }));
}

export function newOrderId() {
  return `CRK-${Date.now().toString(36).toUpperCase()}`;
}
