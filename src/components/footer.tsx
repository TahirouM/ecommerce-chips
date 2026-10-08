import Link from "next/link";
import { categories, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/products";
import { Logo } from "./header";
import { ResetDemoButton } from "./reset-demo-button";

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-foreground bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 text-sm sm:grid-cols-3">
        <div>
          <Logo className="text-3xl" />
          <p className="mt-5 max-w-xs text-background/70">
            Des chips croustillantes, cuites en petits lots avec des pommes de terre françaises. Ça croque, ça craque.
          </p>
        </div>
        <div>
          <p className="font-display text-lg font-bold">Nos chips</p>
          <ul className="mt-3 space-y-2 text-background/70">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="hover:text-primary">
                  {c.emoji} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-lg font-bold">On s&apos;occupe de vous</p>
          <ul className="mt-3 space-y-2 text-background/70">
            <li>Livraison offerte dès {formatPrice(FREE_SHIPPING_THRESHOLD)}</li>
            <li>Expédition sous 24 h</li>
            <li>Sachets 100 % recyclables</li>
            <li>bonjour@craak.example</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-background/15 py-5 text-center text-xs text-background/50">
        CRAAK! — Boutique de démonstration, aucun paiement réel · <ResetDemoButton />
      </p>
    </footer>
  );
}
