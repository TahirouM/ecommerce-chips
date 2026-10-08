"use client";

import { useState } from "react";
import { setPromoCode, useCart, usePromoCode } from "@/lib/cart";
import { computeTotals } from "@/lib/cart-state";
import { formatPrice, FREE_SHIPPING_THRESHOLD, type ShippingId } from "@/lib/products";
import { DEMO_PROMO_CODES, findPromo } from "@/lib/promo";

/** Code promo saisi et validé contre le panier courant (aperçu ; le backend fait foi). */
export function usePromo(subtotal: number) {
  const code = usePromoCode();
  const result = code ? findPromo(code, subtotal) : null;
  return { code, promo: result?.ok ? result.promo : null, error: result && !result.ok ? result.error : null };
}

function PromoField() {
  const { subtotal } = useCart();
  const { code, promo, error } = usePromo(subtotal);
  const [draft, setDraft] = useState("");

  if (code && promo) {
    return (
      <div className="mt-5 flex items-center justify-between gap-2 rounded-xl border-2 border-green bg-green/15 px-4 py-3 text-sm">
        <span>
          🏷️ <strong>{promo.code}</strong> · {promo.label}
        </span>
        <button type="button" onClick={() => setPromoCode(null)} className="font-bold underline underline-offset-4">
          Retirer
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (draft.trim()) setPromoCode(draft.trim().toUpperCase());
      }}
    >
      <label htmlFor="promo" className="text-sm font-bold">
        Code promo
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="promo"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "promo-error" : "promo-hint"}
          className="w-full min-w-0 rounded-full border-2 border-foreground bg-surface px-4 py-2 text-sm uppercase outline-none focus:bg-primary/15"
        />
        <button type="submit" className="btn shrink-0 bg-surface px-4 py-2 text-sm">
          Appliquer
        </button>
      </div>
      {error ? (
        <p id="promo-error" role="alert" className="mt-1.5 text-xs font-semibold text-sale">
          {code} : {error}
        </p>
      ) : (
        <p id="promo-hint" className="mt-1.5 text-xs text-muted">
          Démo : {DEMO_PROMO_CODES.join(", ")}
        </p>
      )}
    </form>
  );
}

export function OrderSummary({
  shippingId,
  withPromo = false,
  children,
}: {
  /** Mode de livraison choisi ; absent sur la page panier (frais calculés à l'étape suivante). */
  shippingId?: ShippingId;
  withPromo?: boolean;
  children?: React.ReactNode;
}) {
  const { subtotal } = useCart();
  const { promo } = usePromo(subtotal);
  const totals = computeTotals(subtotal, shippingId ?? "standard", promo);
  const shippingKnown = shippingId !== undefined || totals.shipping === 0;
  const total = shippingKnown ? totals.total : totals.subtotal - totals.discount;
  const afterDiscount = subtotal - totals.discount;
  const progress = Math.min(100, (afterDiscount / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <aside className="h-fit rounded-2xl border-2 border-foreground bg-surface p-6 shadow-pop-lg lg:sticky lg:top-36">
      <h2 className="font-display text-xl font-extrabold">Récapitulatif</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Sous-total</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-green">
            <dt className="font-semibold">Remise ({promo?.code})</dt>
            <dd className="font-semibold tabular-nums">−{formatPrice(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">Livraison</dt>
          <dd className="font-semibold tabular-nums">
            {!shippingKnown
              ? "Calculée à l'étape suivante"
              : totals.shipping === 0
                ? "Offerte 🎉"
                : formatPrice(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between border-t-2 border-dashed border-foreground/30 pt-3 text-lg font-extrabold">
          <dt>Total TTC</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>
      {subtotal > 0 && !promo?.freeShipping && (
        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full border-2 border-foreground bg-soft">
            <div className="h-full bg-green transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-medium text-muted">
            {afterDiscount >= FREE_SHIPPING_THRESHOLD
              ? "Livraison standard offerte débloquée !"
              : `Plus que ${formatPrice(FREE_SHIPPING_THRESHOLD - afterDiscount)} pour la livraison offerte.`}
          </p>
        </div>
      )}
      {withPromo && subtotal > 0 && <PromoField />}
      {children}
    </aside>
  );
}
