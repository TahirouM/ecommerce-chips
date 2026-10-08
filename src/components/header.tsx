import Link from "next/link";
import { categories, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/products";
import { AccountLink } from "./account-link";
import { CartLink } from "./cart-link";
import { FavoritesLink } from "./favorites-link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block -rotate-3 rounded-xl border-2 border-foreground bg-primary px-3 py-0.5 font-display text-2xl font-extrabold tracking-tight text-foreground shadow-pop-sm ${className}`}
    >
      CRAAK!
    </span>
  );
}

const NAV = [
  { href: "/produits", name: "Tout" },
  ...categories.map((c) => ({ href: `/categories/${c.slug}`, name: c.name })),
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 print:hidden">
      <p className="bg-foreground px-4 py-2 text-center text-xs font-semibold text-background sm:text-sm">
        🧪 Boutique de démonstration : aucun paiement réel · 🚚 Livraison offerte dès{" "}
        {formatPrice(FREE_SHIPPING_THRESHOLD)}
      </p>
      <div className="border-b-2 border-foreground bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-4 lg:gap-8">
          <Link href="/" aria-label="Accueil">
            <Logo />
          </Link>
          <nav aria-label="Univers" className="hidden gap-1 text-sm font-semibold lg:flex">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 hover:bg-primary">
                {l.name}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <FavoritesLink />
            <AccountLink />
            <CartLink />
          </div>
        </div>
        {/* Sur mobile, les univers passent sur une ligne défilante sous la barre principale. */}
        <nav aria-label="Univers" className="border-t border-foreground/15 lg:hidden">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 text-sm font-semibold">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="shrink-0 rounded-full px-3 py-1 hover:bg-primary">
                {l.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
