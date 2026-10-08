"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cart, useCart } from "@/lib/cart";
import { shippingCost } from "@/lib/cart-state";
import { newOrderId, saveOrder, toOrderLines } from "@/lib/order";
import { formatPrice, SHIPPING_OPTIONS, type ShippingId } from "@/lib/products";
import { OrderSummary } from "./order-summary";

const input =
  "w-full rounded-xl border-2 border-foreground bg-surface px-4 py-3 text-sm outline-none focus:bg-primary/15 focus:shadow-pop-sm";

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal } = useCart();
  const [shippingId, setShippingId] = useState<ShippingId>("standard");
  const [submitting, setSubmitting] = useState(false);

  const shipping = shippingCost(subtotal, shippingId);

  if (lines.length === 0 && !submitting) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted">Votre panier est vide.</p>
        <Link href="/produits" className="mt-8 btn bg-primary">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const id = newOrderId();
    saveOrder({
      id,
      email: String(data.get("email")),
      name: `${data.get("firstName")} ${data.get("lastName")}`,
      address: `${data.get("address")}, ${data.get("zip")} ${data.get("city")}`,
      lines: toOrderLines(lines),
      shipping,
      total: subtotal + shipping,
    });
    cart.clear();
    router.push("/commande/confirmation");
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <fieldset className="space-y-4">
          <legend className="mb-4 font-display text-xl font-extrabold">Contact</legend>
          <input
            name="email"
            type="email"
            required
            placeholder="Adresse e-mail"
            autoComplete="email"
            className={input}
          />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-4 font-display text-xl font-extrabold">Adresse de livraison</legend>
          <input name="firstName" required placeholder="Prénom" autoComplete="given-name" className={input} />
          <input name="lastName" required placeholder="Nom" autoComplete="family-name" className={input} />
          <input
            name="address"
            required
            placeholder="Adresse"
            autoComplete="street-address"
            className={`${input} sm:col-span-2`}
          />
          <input
            name="zip"
            required
            placeholder="Code postal"
            pattern="\d{5}"
            title="5 chiffres"
            inputMode="numeric"
            autoComplete="postal-code"
            className={input}
          />
          <input name="city" required placeholder="Ville" autoComplete="address-level2" className={input} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-4 font-display text-xl font-extrabold">Mode de livraison</legend>
          {SHIPPING_OPTIONS.map((o) => {
            const price = shippingCost(subtotal, o.id);
            return (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-foreground bg-surface px-4 py-3 text-sm font-semibold has-checked:bg-primary has-checked:shadow-pop-sm"
              >
                <input
                  type="radio"
                  name="shipping"
                  value={o.id}
                  checked={shippingId === o.id}
                  onChange={() => setShippingId(o.id)}
                  className="accent-[var(--foreground)]"
                />
                <span className="flex-1">{o.label}</span>
                <span className="tabular-nums">{price === 0 ? "Offerte" : formatPrice(price)}</span>
              </label>
            );
          })}
        </fieldset>

        <fieldset>
          <legend className="mb-4 font-display text-xl font-extrabold">Paiement</legend>
          <p className="rounded-xl border-2 border-dashed border-foreground/40 px-4 py-3 text-sm text-muted">
            Mode démo : aucun paiement n&apos;est encaissé. Le paiement (Stripe, etc.) se branche ici.
          </p>
        </fieldset>
      </div>

      <OrderSummary shipping={shipping}>
        <ul className="mt-6 space-y-2 border-t-2 border-dashed border-foreground/30 pt-4 text-sm">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-2">
              <span className="text-muted">
                {l.quantity} × {l.product.name}
              </span>
              <span className="tabular-nums">{formatPrice(l.total)}</span>
            </li>
          ))}
        </ul>
        <button type="submit" disabled={submitting} className="mt-6 btn w-full bg-primary">
          {submitting ? "Validation…" : `Valider la commande · ${formatPrice(subtotal + shipping)}`}
        </button>
      </OrderSummary>
    </form>
  );
}
