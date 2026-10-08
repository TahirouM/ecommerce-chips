"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { loadOrder, type Order } from "@/lib/order";
import { formatPrice } from "@/lib/products";

let cached: Order | null | undefined;
const getOrder = () => (cached === undefined ? (cached = loadOrder()) : cached);

export function OrderConfirmation() {
  const order = useSyncExternalStore(
    () => () => {},
    getOrder,
    () => undefined,
  );

  if (order === undefined) return null;

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-muted">Aucune commande récente.</p>
        <Link href="/produits" className="mt-8 btn bg-primary">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-6xl">🎉</p>
      <p className="mt-4 inline-block -rotate-2 rounded-full border-2 border-foreground bg-accent px-4 py-1 text-sm font-bold text-accent-foreground">
        Merci {order.name.split(" ")[0]} !
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">Commande confirmée !</h1>
      <p className="mt-4 text-muted">
        Votre commande <span className="font-medium text-foreground">{order.id}</span> est enregistrée. Vos chips
        arrivent bientôt. Un récapitulatif sera envoyé à {order.email}.
      </p>
      <div className="mt-8 rounded-2xl border-2 border-foreground bg-surface p-6 text-sm shadow-pop-lg">
        <ul className="space-y-2">
          {order.lines.map((l) => (
            <li key={l.name} className="flex justify-between gap-2">
              <span className="text-muted">
                {l.quantity} × {l.name}
              </span>
              <span className="tabular-nums">{formatPrice(l.total)}</span>
            </li>
          ))}
          <li className="flex justify-between">
            <span className="text-muted">Livraison</span>
            <span className="tabular-nums">{order.shipping ? formatPrice(order.shipping) : "Offerte"}</span>
          </li>
        </ul>
        <p className="mt-4 flex justify-between border-t-2 border-dashed border-foreground/30 pt-4 text-lg font-extrabold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.total)}</span>
        </p>
        <p className="mt-6 text-muted">Livraison à : {order.address}</p>
      </div>
      <Link href="/produits" className="mt-8 btn bg-primary">
        Reprendre des chips
      </Link>
    </div>
  );
}
