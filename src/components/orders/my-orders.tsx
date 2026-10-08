"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { errorMessage, listMyOrders, type Order } from "@/lib/backend";
import { orderStatus } from "@/lib/order-status";
import { formatPrice } from "@/lib/products";
import { useNow } from "@/lib/use-now";
import { useUser } from "../account/account-shell";
import { PageTitle } from "../account/page-title";
import { FormError } from "../ui/form";
import { StatusBadge } from "./status";

/** Commandes du client connecté (null = chargement). */
export function useMyOrders() {
  const user = useUser();
  const [state, setState] = useState<{ userId: string; orders: Order[] | null; error: string | null } | null>(null);
  useEffect(() => {
    listMyOrders()
      .then((orders) => setState({ userId: user.id, orders, error: null }))
      .catch((e) => setState({ userId: user.id, orders: null, error: errorMessage(e) }));
  }, [user.id]);
  return state?.userId === user.id ? state : null;
}

export function MyOrders() {
  const state = useMyOrders();
  const now = useNow();

  return (
    <>
      <PageTitle intro="Suivez vos colis, téléchargez vos factures ou recommandez vos saveurs préférées.">
        Mes commandes
      </PageTitle>
      {!state ? (
        <div className="space-y-4" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-soft" />
          ))}
        </div>
      ) : state.error ? (
        <FormError>{state.error}</FormError>
      ) : state.orders!.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-5xl">📦</p>
          <p className="mt-4 text-muted">Aucune commande pour l&apos;instant.</p>
          <Link href="/produits" className="mt-6 btn bg-primary">
            Choisir mes chips
          </Link>
        </div>
      ) : (
        <ul aria-label="Mes commandes" className="space-y-4">
          {state.orders!.map((o) => (
            <li key={o.id}>
              <Link
                href={`/compte/commandes/detail?id=${o.id}`}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border-2 border-foreground bg-surface p-5 shadow-pop transition hover:-translate-y-0.5 hover:shadow-pop-lg"
              >
                <div className="min-w-40 flex-1">
                  <p className="font-display text-lg font-extrabold">{o.id}</p>
                  <p className="text-sm text-muted">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {o.lines.reduce((n, l) => n + l.quantity, 0)} article(s)
                  </p>
                </div>
                <StatusBadge status={orderStatus(o, now)} />
                <p className="ml-auto font-bold tabular-nums sm:ml-0 sm:w-24 sm:text-right">{formatPrice(o.total)}</p>
                <span aria-hidden className="hidden text-xl sm:inline">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
