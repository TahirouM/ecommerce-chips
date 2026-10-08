import Link from "next/link";
import { ChipBag } from "@/components/chip-bag";
import { ProductGrid } from "@/components/product-card";
import { categories, formatPrice, FREE_SHIPPING_THRESHOLD, getProduct, products } from "@/lib/products";

const HERO_BAGS = [
  { slug: "paprika-fume", className: "left-0 top-10 w-[38%] -rotate-10", delay: "0s" },
  { slug: "sel-de-mer", className: "left-[31%] top-0 z-10 w-[40%] rotate-2", delay: "0.6s" },
  { slug: "truffe-noire", className: "right-0 top-12 w-[38%] rotate-12", delay: "1.2s" },
];

const PERKS = [
  { emoji: "🥔", title: "Pommes de terre françaises", text: "Sélectionnées chez des producteurs des Hauts-de-France.", color: "bg-primary" },
  { emoji: "🔥", title: "Cuites en petits lots", text: "Au chaudron, pour un croustillant épais et irrégulier.", color: "bg-orange" },
  { emoji: "♻️", title: "Sachets recyclables", text: "Un emballage mono-matériau, sans aluminium.", color: "bg-green" },
];

export default function Home() {
  const featured = products.filter((p) => p.featured);
  const flavors = products.map((p) => `${p.emoji} ${p.short}`);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="inline-block rotate-[-2deg] rounded-full border-2 border-foreground bg-accent px-4 py-1 text-sm font-bold text-accent-foreground shadow-pop-sm">
            Nouvelles saveurs 🎉
          </p>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Ça croque.
            <br />
            <span className="relative isolate inline-block">
              <span className="absolute inset-x-[-0.15em] bottom-[0.08em] -z-10 h-[0.45em] -rotate-1 bg-primary" />
              Ça craque.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Des chips artisanales cuites en petits lots, en France. Classiques, relevées, gourmandes ou légères :
            il y a forcément un sachet pour vous.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/produits" className="btn bg-primary">
              Croquer maintenant →
            </Link>
            <Link href="/produits/box-decouverte" className="btn bg-surface">
              🎁 Box découverte
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-[5/4] w-full max-w-lg">
          <div className="absolute top-1/2 left-1/2 aspect-square w-[78%] -translate-1/2 rounded-full border-2 border-foreground bg-primary" />
          <div className="absolute top-1/2 left-1/2 aspect-square w-[56%] -translate-1/2 rounded-full border-2 border-dashed border-foreground/40" />
          {HERO_BAGS.map(({ slug, className, delay }) => {
            const product = getProduct(slug)!;
            return (
              <Link
                key={slug}
                href={`/produits/${slug}`}
                className={`animate-float absolute ${className}`}
                style={{ animationDelay: delay }}
              >
                <ChipBag product={product} className="w-full drop-shadow-[6px_8px_0_rgba(26,26,46,0.25)]" />
              </Link>
            );
          })}
          <span className="absolute -bottom-2 right-2 z-20 rotate-[8deg] rounded-full border-2 border-foreground bg-surface px-4 py-2 text-center font-display text-sm font-extrabold leading-tight shadow-pop">
            dès {formatPrice(Math.min(...products.map((p) => p.price)))}
            <br />
            le sachet
          </span>
        </div>
      </section>

      <div className="overflow-hidden border-y-2 border-foreground bg-accent py-3 text-accent-foreground" aria-hidden>
        <div className="animate-marquee flex w-max font-display text-xl font-extrabold whitespace-nowrap">
          {[...flavors, ...flavors].map((f, i) => (
            <span key={i} className="flex items-center gap-8 pr-8">
              {f}
              <span className="text-primary">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Choisissez votre camp</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className={`group rounded-2xl border-2 border-foreground p-5 shadow-pop transition hover:-translate-y-1 hover:shadow-pop-lg ${
                i === categories.length - 1 ? "col-span-2 md:col-span-1" : ""
              }`}
              style={{ backgroundColor: c.color }}
            >
              <span className="block text-4xl transition group-hover:scale-125 group-hover:-rotate-12">{c.emoji}</span>
              <p className="mt-4 font-display text-xl font-extrabold">{c.name}</p>
              <p className="mt-1 text-sm text-foreground/75">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Les chouchous 💛</h2>
          <Link href="/produits" className="text-sm font-bold underline underline-offset-4 hover:text-accent">
            Toutes les chips →
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-2xl border-2 border-foreground bg-surface p-6 shadow-pop">
              <span className={`inline-flex size-14 items-center justify-center rounded-full border-2 border-foreground text-2xl ${p.color}`}>
                {p.emoji}
              </span>
              <p className="mt-4 font-display text-xl font-extrabold">{p.title}</p>
              <p className="mt-1 text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border-2 border-foreground bg-blue px-6 py-12 text-white shadow-pop-lg sm:px-12">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl font-extrabold sm:text-5xl">Soirée prévue ? On s&apos;occupe de l&apos;apéro.</h2>
            <p className="mt-4 text-lg text-white/85">
              12 sachets, du plus doux au plus piquant, livrés dans une boîte cadeau. Et la livraison est offerte dès{" "}
              {formatPrice(FREE_SHIPPING_THRESHOLD)}.
            </p>
            <Link href="/produits/pack-soiree" className="btn mt-8 bg-primary text-foreground">
              🎉 Voir le pack soirée
            </Link>
          </div>
          <ChipBag
            product={getProduct("pack-soiree")!}
            className="pointer-events-none absolute -right-6 -bottom-10 hidden w-64 rotate-12 md:block"
          />
          <ChipBag
            product={getProduct("habanero-extreme")!}
            className="pointer-events-none absolute right-52 -bottom-16 hidden w-48 -rotate-12 lg:block"
          />
        </div>
      </section>
    </>
  );
}
