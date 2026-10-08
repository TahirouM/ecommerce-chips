import Link from "next/link";
import { formatPrice, formatWeight, SPICE_LABELS, type Product } from "@/lib/products";
import { ProductVisual } from "./chip-bag";
import { QuickAdd } from "./quick-add";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-surface shadow-pop transition hover:-translate-y-1 hover:shadow-pop-lg">
      <Link href={`/produits/${product.slug}`} prefetch className="relative block">
        <ProductVisual
          product={product}
          className="aspect-square border-b-2 border-foreground"
          bagClassName="transition duration-300 group-hover:-rotate-6 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <Badge className="bg-foreground text-background">Épuisé</Badge>
          ) : (
            <>
              {product.compareAtPrice && <Badge className="bg-sale text-white">Promo</Badge>}
              {product.isNew && <Badge className="bg-primary">Nouveau</Badge>}
            </>
          )}
        </div>
        {product.spice > 0 && (
          <span
            className="absolute right-3 top-3 rounded-full border-2 border-foreground bg-surface px-2 py-0.5 text-xs"
            title={SPICE_LABELS[product.spice]}
          >
            {"🌶️".repeat(product.spice)}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link href={`/produits/${product.slug}`} className="font-display text-lg font-bold leading-tight hover:underline">
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted">
            {formatWeight(product.weight)} · ★ {product.rating.toFixed(1)}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <Price product={product} className="text-base" />
          <QuickAdd slug={product.slug} stock={product.stock} name={product.name} />
        </div>
      </div>
    </article>
  );
}

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

export function Price({ product, className = "text-sm" }: { product: Product; className?: string }) {
  return (
    <p className={`shrink-0 font-bold tabular-nums ${className}`}>
      {product.compareAtPrice && (
        <span className="mr-2 text-[0.8em] font-medium text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
      )}
      <span className={product.compareAtPrice ? "text-sale" : undefined}>{formatPrice(product.price)}</span>
    </p>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
