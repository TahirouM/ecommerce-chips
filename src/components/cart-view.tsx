"use client";

import Link from "next/link";
import { availableStock } from "@/lib/backend";
import { cart, useCart } from "@/lib/cart";
import { formatPrice, formatWeight } from "@/lib/products";
import { ProductVisual } from "./chip-bag";
import { OrderSummary } from "./order-summary";
import { QuantityInput } from "./quantity-input";

export function CartView() {
  const { lines } = useCart();

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-6xl">🥔</p>
        <p className="mt-4 text-lg text-muted">Votre panier est vide… pas pour longtemps ?</p>
        <Link href="/produits" className="mt-8 btn bg-primary">
          Choisir mes chips
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="space-y-4">
        {lines.map(({ slug, quantity, product, total }) => (
          <li key={slug} className="flex gap-4 rounded-2xl border-2 border-foreground bg-surface p-3 shadow-pop">
            <Link href={`/produits/${slug}`} className="shrink-0">
              <ProductVisual product={product} className="size-24 rounded-xl border-2 border-foreground" />
            </Link>
            <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <Link href={`/produits/${slug}`} className="font-display text-lg font-bold hover:underline">
                  {product.name}
                </Link>
                <p className="text-sm text-muted tabular-nums">
                  {formatPrice(product.price)} · {formatWeight(product.weight)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <QuantityInput
                  value={quantity}
                  max={availableStock(slug)}
                  onChange={(q) => cart.setQuantity(slug, q)}
                />
                <p className="w-20 text-right font-bold tabular-nums">{formatPrice(total)}</p>
                <button
                  onClick={() => cart.remove(slug)}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-foreground text-sm hover:bg-sale hover:text-white"
                  aria-label={`Retirer ${product.name}`}
                >
                  ✕
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <OrderSummary>
        <Link href="/commande" className="mt-6 btn w-full bg-primary">
          Passer commande →
        </Link>
      </OrderSummary>
    </div>
  );
}
