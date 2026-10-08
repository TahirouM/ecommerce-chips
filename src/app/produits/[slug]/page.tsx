import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { FavoriteButton } from "@/components/favorite-button";
import { StockStatus } from "@/components/stock-status";
import { ProductVisual } from "@/components/chip-bag";
import { Badge, Price, ProductGrid } from "@/components/product-card";
import { formatWeight, getCategory, getProduct, pricePerKg, products, SPICE_LABELS } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produits/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/produits/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const category = getCategory(product.category);
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .concat(products.filter((p) => p.featured && p.category !== product.category))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm font-semibold text-muted">
        <Link href="/produits" className="hover:text-foreground">
          Boutique
        </Link>
        {" / "}
        {category && (
          <Link href={`/categories/${category.slug}`} className="hover:text-foreground">
            {category.name}
          </Link>
        )}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative">
          <ProductVisual
            product={product}
            className="aspect-square rounded-3xl border-2 border-foreground shadow-pop-lg"
            bagClassName="-rotate-6"
          />
          <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
            {product.compareAtPrice && <Badge className="bg-sale text-white">Promo</Badge>}
            {product.isNew && <Badge className="bg-primary">Nouveau</Badge>}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{product.name}</h1>
            <FavoriteButton slug={product.slug} name={product.name} className="mt-1 size-12 text-2xl" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Price product={product} className="text-2xl" />
            <span className="text-sm text-muted">
              {formatWeight(product.weight)} · {pricePerKg(product)}/kg
            </span>
            <span className="text-sm font-semibold">★ {product.rating.toFixed(1)}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border-2 border-foreground bg-surface px-3 py-1 text-sm font-semibold">
              {product.spice ? "🌶️".repeat(product.spice) : "😌"} {SPICE_LABELS[product.spice]}
            </span>
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="rounded-full border-2 border-foreground px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: category.color }}
              >
                {category.emoji} {category.name}
              </Link>
            )}
          </div>

          <p className="mt-6 text-lg leading-relaxed text-muted">{product.description}</p>
          <ul className="mt-6 space-y-2">
            {product.details.map((d) => (
              <li key={d} className="flex items-center gap-3 font-medium">
                <span className="flex size-6 items-center justify-center rounded-full border-2 border-foreground bg-primary text-xs">
                  ✓
                </span>
                {d}
              </li>
            ))}
          </ul>
          <StockStatus slug={product.slug} />
          <AddToCart slug={product.slug} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl font-extrabold">Ça devrait vous plaire aussi</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
