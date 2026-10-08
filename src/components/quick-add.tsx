"use client";

import { useEffect, useState } from "react";
import { useAvailableStock } from "@/lib/backend/hooks";
import { cart, useCart } from "@/lib/cart";

export function QuickAdd({ slug, name }: { slug: string; name: string }) {
  const stock = useAvailableStock(slug);
  const [added, setAdded] = useState(false);
  const inCart = useCart().lines.find((l) => l.slug === slug)?.quantity ?? 0;
  const full = inCart >= stock;

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <button
      onClick={() => {
        cart.add(slug, 1);
        setAdded(true);
      }}
      disabled={full}
      aria-label={stock === 0 ? `${name} épuisé` : `Ajouter ${name} au panier`}
      className={`btn size-11 shrink-0 p-0 text-xl ${added ? "bg-green" : "bg-primary"}`}
    >
      {added ? "✓" : "+"}
    </button>
  );
}
