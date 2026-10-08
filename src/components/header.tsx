import Link from "next/link";
import { categories, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/products";
import { AccountLink } from "./account-link";
import { CartLink } from "./cart-link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block -rotate-3 rounded-xl border-2 border-foreground bg-primary px-3 py-0.5 font-display text-2xl font-extrabold tracking-tight text-foreground shadow-pop-sm ${className}`}
    >
      CRAAK!
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20">
      <p className="bg-foreground px-4 py-2 text-center text-xs font-semibold text-background sm:text-sm">
        🧪 Boutique de démonstration : aucun paiement réel · 🚚 Livraison offerte dès{" "}
        {formatPrice(FREE_SHIPPING_THRESHOLD)}
      </p>
      <div className="border-b-2 border-foreground bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-4 lg:gap-8">
          <Link href="/" aria-label="Accueil">
            <Logo />
          </Link>
          <nav className="hidden gap-1 text-sm font-semibold lg:flex">
            <Link href="/produits" className="rounded-full px-3 py-1.5 hover:bg-primary">
              Tout
            </Link>
            {categories.map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`} className="rounded-full px-3 py-1.5 hover:bg-primary">
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link
              href="/produits"
              className="text-sm font-semibold whitespace-nowrap underline-offset-4 hover:underline lg:hidden"
            >
              Boutique
            </Link>
            <AccountLink />
            <CartLink />
          </div>
        </div>
      </div>
    </header>
  );
}
