"use client";

import { useMemo, useState } from "react";
import { categories, type Product } from "@/lib/products";
import { ProductGrid } from "./product-card";

const SORTS = {
  featured: { label: "Pertinence", fn: () => 0 },
  "price-asc": { label: "Prix croissant", fn: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Prix décroissant", fn: (a: Product, b: Product) => b.price - a.price },
  rating: { label: "Mieux notées", fn: (a: Product, b: Product) => b.rating - a.rating },
  spice: { label: "Les plus piquantes", fn: (a: Product, b: Product) => b.spice - a.spice },
} as const;

const chip =
  "rounded-full border-2 border-foreground bg-surface px-3.5 py-1.5 text-sm font-semibold transition hover:bg-primary aria-pressed:bg-foreground aria-pressed:text-background";

export function Catalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<keyof typeof SORTS>("featured");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => category === "all" || p.category === category)
      .filter((p) => !q || `${p.name} ${p.description}`.toLowerCase().includes(q))
      .toSorted(SORTS[sort].fn);
  }, [products, query, category, sort]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Paprika, truffe, vegan…"
          aria-label="Rechercher"
          className="w-full rounded-full border-2 border-foreground bg-surface px-4 py-2.5 text-sm shadow-pop-sm outline-none focus:bg-primary/20 lg:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {[{ slug: "all", name: "Tout", emoji: "✨" }, ...categories].map((c) => (
            <button key={c.slug} onClick={() => setCategory(c.slug)} aria-pressed={category === c.slug} className={chip}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as keyof typeof SORTS)}
          aria-label="Trier"
          className="rounded-full border-2 border-foreground bg-surface px-3 py-2 text-sm font-semibold lg:ml-auto"
        >
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-6 text-sm font-semibold text-muted">
        {visible.length} saveur{visible.length > 1 ? "s" : ""}
      </p>
      <div className="mt-4">
        {visible.length > 0 ? (
          <ProductGrid products={visible} />
        ) : (
          <p className="py-20 text-center text-lg text-muted">🥲 Aucune chips ne correspond à votre recherche.</p>
        )}
      </div>
    </>
  );
}
