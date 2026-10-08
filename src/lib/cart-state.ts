import { FREE_SHIPPING_THRESHOLD, getProduct, SHIPPING_OPTIONS, type Product, type ShippingId } from "./products";
import { promoDiscount, type Promo } from "./promo";

/**
 * Logique métier du panier, sans React ni navigateur : fonctions pures, testées
 * dans cart-state.test.ts. Le store de `cart.ts` ne fait que les appeler.
 */

export type CartItem = { slug: string; quantity: number };
export type CartLine = CartItem & { product: Product; total: number };

/** Stock disponible d'un produit. Par défaut celui du catalogue ; le store injecte le stock réel. */
export type StockOf = (slug: string) => number;
export const catalogStock: StockOf = (slug) => getProduct(slug)?.stock ?? 0;

/** Ramène une quantité dans l'intervalle [0, stock disponible]. */
export function clampQuantity(slug: string, quantity: number, stockOf: StockOf = catalogStock) {
  return Math.max(0, Math.min(quantity, stockOf(slug)));
}

export function addItem(items: CartItem[], slug: string, quantity = 1, stockOf: StockOf = catalogStock): CartItem[] {
  const existing = items.find((i) => i.slug === slug);
  const qty = clampQuantity(slug, (existing?.quantity ?? 0) + quantity, stockOf);
  if (qty === 0) return items;
  return existing
    ? items.map((i) => (i.slug === slug ? { ...i, quantity: qty } : i))
    : [...items, { slug, quantity: qty }];
}

export function setItemQuantity(
  items: CartItem[],
  slug: string,
  quantity: number,
  stockOf: StockOf = catalogStock,
): CartItem[] {
  const qty = clampQuantity(slug, quantity, stockOf);
  return qty === 0
    ? items.filter((i) => i.slug !== slug)
    : items.map((i) => (i.slug === slug ? { ...i, quantity: qty } : i));
}

export function removeItem(items: CartItem[], slug: string): CartItem[] {
  return items.filter((i) => i.slug !== slug);
}

/** Relit un panier sauvegardé : les produits qui n'existent plus sont écartés. */
export function parseCart(raw: string | null): CartItem[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((i) => getProduct(i.slug)) : [];
  } catch {
    return [];
  }
}

export function summarize(items: CartItem[]) {
  const lines: CartLine[] = items.flatMap((item) => {
    const product = getProduct(item.slug);
    return product ? [{ ...item, product, total: product.price * item.quantity }] : [];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { lines, count, subtotal, freeShipping: subtotal >= FREE_SHIPPING_THRESHOLD };
}

/** Frais de port en centimes : seule la livraison standard devient offerte au-delà du seuil. */
export function shippingCost(subtotal: number, shippingId: ShippingId) {
  const option = SHIPPING_OPTIONS.find((o) => o.id === shippingId)!;
  return shippingId === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : option.price;
}

export type Totals = { subtotal: number; discount: number; shipping: number; total: number };

/**
 * Totaux d'une commande, en centimes. Le seuil de livraison offerte s'apprécie après remise.
 * Utilisé pour l'aperçu dans l'interface ET par le backend, dont le calcul fait foi.
 */
export function computeTotals(subtotal: number, shippingId: ShippingId, promo: Promo | null = null): Totals {
  const discount = promoDiscount(promo, subtotal);
  const shipping = promo?.freeShipping ? 0 : shippingCost(subtotal - discount, shippingId);
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
