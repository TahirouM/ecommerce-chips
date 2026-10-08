"use client";

import { useCart } from "@/lib/cart";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/products";

export function OrderSummary({ shipping, children }: { shipping?: number; children?: React.ReactNode }) {
  const { subtotal, freeShipping } = useCart();
  // Le mode de livraison choisi fait foi ; sans choix (page panier), la standard offerte vaut 0.
  const shippingCost = shipping ?? (freeShipping ? 0 : undefined);
  const total = subtotal + (shippingCost ?? 0);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <aside className="h-fit rounded-2xl border-2 border-foreground bg-surface p-6 shadow-pop-lg lg:sticky lg:top-32">
      <h2 className="font-display text-xl font-extrabold">Récapitulatif</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Sous-total</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Livraison</dt>
          <dd className="font-semibold tabular-nums">
            {shippingCost === 0
              ? "Offerte 🎉"
              : shippingCost === undefined
                ? "Calculée à l'étape suivante"
                : formatPrice(shippingCost)}
          </dd>
        </div>
        <div className="flex justify-between border-t-2 border-dashed border-foreground/30 pt-3 text-lg font-extrabold">
          <dt>Total TTC</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>
      {subtotal > 0 && (
        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full border-2 border-foreground bg-soft">
            <div className="h-full bg-green transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-muted">
            {freeShipping
              ? "Livraison offerte débloquée !"
              : `Plus que ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} pour la livraison offerte.`}
          </p>
        </div>
      )}
      {children}
    </aside>
  );
}
