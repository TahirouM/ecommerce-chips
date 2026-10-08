import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { products } from "@/lib/products";

export const metadata: Metadata = { title: "Toutes nos chips" };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Toutes nos chips</h1>
      <p className="mt-2 text-lg text-muted">Du plus doux au plus piquant, faites votre sélection.</p>
      <Catalog products={products} />
    </div>
  );
}
