"use client";

import Link from "next/link";
import { useState } from "react";
import { cart, useCart } from "@/lib/cart";
import { QuantityInput } from "./quantity-input";

export function AddToCart({ slug, stock }: { slug: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = useCart().lines.find((l) => l.slug === slug)?.quantity ?? 0;
  const remaining = stock - inCart;

  if (stock === 0) {
    return (
      <button disabled className="btn mt-8 w-full bg-soft">
        Indisponible pour le moment
      </button>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex gap-3">
        <QuantityInput value={quantity} max={Math.max(1, remaining)} onChange={setQuantity} />
        <button
          disabled={remaining === 0}
          onClick={() => {
            cart.add(slug, quantity);
            setQuantity(1);
            setAdded(true);
          }}
          className="btn flex-1 bg-primary text-base"
        >
          {remaining === 0 ? "Stock maximum atteint" : "Ajouter au panier 🛒"}
        </button>
      </div>
      {added && (
        <p className="rounded-xl border-2 border-foreground bg-green/20 px-4 py-3 text-sm font-medium" role="status">
          Miam, c&apos;est dans le panier ({inCart}) !{" "}
          <Link href="/panier" className="font-bold underline underline-offset-4">
            Voir le panier →
          </Link>
        </p>
      )}
    </div>
  );
}
