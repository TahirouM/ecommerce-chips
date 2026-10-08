"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { errorMessage, getOrder, type Order } from "@/lib/backend";
import { useSession } from "@/lib/backend/hooks";
import { parseLastOrder, readLastOrderRaw } from "@/lib/last-order";
import { formatPrice, SHIPPING_OPTIONS } from "@/lib/products";

type Result = { id: string; order: Order } | { id: string; error: string };

const noSubscribe = () => () => {};

/** Date de livraison estimée : 1 jour ouvré en express, 2 à 4 en standard. */
function estimatedDelivery(order: Order) {
  const add = (days: number) => {
    const d = new Date(order.createdAt);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  };
  return order.shippingId === "express" ? add(1) : `entre le ${add(2)} et le ${add(4)}`;
}

export function OrderConfirmation() {
  const user = useSession();
  // Référence lue dans sessionStorage : inconnue (undefined) pendant le rendu serveur.
  const raw = useSyncExternalStore(noSubscribe, readLastOrderRaw, () => undefined);
  const last = useMemo(() => (raw === undefined ? undefined : parseLastOrder(raw)), [raw]);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!last) return;
    getOrder(last.id, last.email)
      .then((order) => setResult({ id: last.id, order }))
      .catch((e) => setResult({ id: last.id, error: errorMessage(e) }));
  }, [last]);

  if (last === undefined || (last && result?.id !== last.id)) {
    return <div className="h-96 animate-pulse rounded-2xl bg-soft" aria-hidden />;
  }

  if (!last || !result || "error" in result) {
    return (
      <div className="text-center">
        <p className="text-muted">{result && "error" in result ? result.error : "Aucune commande récente."}</p>
        <Link href="/produits" className="mt-8 btn bg-primary">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const { order } = result;
  const firstName = order.address.firstName;

  return (
    <div>
      <p className="text-6xl">🎉</p>
      <p className="mt-4 inline-block -rotate-2 rounded-full border-2 border-foreground bg-accent px-4 py-1 text-sm font-bold text-accent-foreground">
        Merci {firstName} !
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Commande confirmée !</h1>
      <p className="mt-4 text-muted">
        Votre commande <span className="font-bold text-foreground">{order.id}</span> est payée. Un récapitulatif a été
        envoyé à {order.email} (simulation).
      </p>
      <p className="mt-2 font-semibold">🚚 Livraison estimée {estimatedDelivery(order)}.</p>

      <div className="mt-8 rounded-2xl border-2 border-foreground bg-surface p-6 text-sm shadow-pop-lg">
        <ul className="space-y-2">
          {order.lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-2">
              <span className="text-muted">
                {l.quantity} × {l.name}
              </span>
              <span className="tabular-nums">{formatPrice(l.total)}</span>
            </li>
          ))}
          {order.discount > 0 && (
            <li className="flex justify-between font-semibold text-green">
              <span>Remise ({order.promoCode})</span>
              <span className="tabular-nums">−{formatPrice(order.discount)}</span>
            </li>
          )}
          <li className="flex justify-between">
            <span className="text-muted">{SHIPPING_OPTIONS.find((o) => o.id === order.shippingId)?.label}</span>
            <span className="tabular-nums">{order.shipping ? formatPrice(order.shipping) : "Offerte"}</span>
          </li>
        </ul>
        <p className="mt-4 flex justify-between border-t-2 border-dashed border-foreground/30 pt-4 text-lg font-extrabold">
          <span>Total payé</span>
          <span className="tabular-nums">{formatPrice(order.total)}</span>
        </p>
        <div className="mt-6 grid gap-4 text-muted sm:grid-cols-2">
          <p>
            <strong className="text-foreground">Livraison à</strong>
            <br />
            {order.address.firstName} {order.address.lastName}, {order.address.line1}, {order.address.zip}{" "}
            {order.address.city}
          </p>
          <p>
            <strong className="text-foreground">Paiement</strong>
            <br />
            {order.payment.brand === "carte" ? "Carte" : order.payment.brand.toUpperCase()} •••• {order.payment.last4}
            {order.payment.threeDSecure && " · authentifié 3-D Secure"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        {user ? (
          <Link href="/compte" className="btn bg-primary">
            Voir mon compte
          </Link>
        ) : (
          <Link href="/inscription" className="btn bg-primary">
            Créer un compte pour suivre ma commande
          </Link>
        )}
        <Link href="/produits" className="btn bg-surface">
          Reprendre des chips
        </Link>
      </div>
    </div>
  );
}
