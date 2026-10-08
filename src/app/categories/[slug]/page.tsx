import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-card";
import { categories, getCategory, products } from "@/lib/products";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return { title: category?.name };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const items = products.filter((p) => p.category === category.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div
        className="flex items-center gap-6 rounded-3xl border-2 border-foreground px-6 py-8 shadow-pop-lg sm:px-10"
        style={{ backgroundColor: category.color }}
      >
        <span className="text-6xl sm:text-7xl">{category.emoji}</span>
        <div>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{category.name}</h1>
          <p className="mt-2 text-lg text-foreground/80">{category.description}</p>
        </div>
      </div>
      <div className="mt-12">
        <ProductGrid products={items} />
      </div>
    </div>
  );
}
