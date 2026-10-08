"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cancelOrder, type Order } from "@/lib/backend";
import { cart } from "@/lib/cart";
import { isCancellable, orderStatus } from "@/lib/order-status";
import { formatPrice, getProduct, SHIPPING_OPTIONS } from "@/lib/products";
import { useAsyncAction } from "@/lib/use-async-action";
import { useNow } from "@/lib/use-now";
import { ProductVisual } from "../chip-bag";
import { Card, FormError, FormSuccess } from "../ui/form";
import { OrderTimeline, StatusBadge } from "./status";

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Détail d'une commande, partagé par l'espace client et le suivi invité.
 * `email` est fourni par l'invité : il l'autorise à annuler sa commande.
 */
export function OrderDetail({ order: initial, email, backHref }: { order: Order; email?: string; backHref?: string }) {
  const router = useRouter();
  const now = useNow();
  const [order, setOrder] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const { pending, error, run } = useAsyncAction();
  const status = orderStatus(order, now);
  const shipped = status === "expediee" || status === "livree";

  function reorder() {
    const unavailable: string[] = [];
    for (const line of order.lines) {
      const before = cart.quantityOf(line.slug);
      cart.add(line.slug, line.quantity);
      if (cart.quantityOf(line.slug) - before < line.quantity) unavailable.push(line.name);
    }
    if (unavailable.length) {
      setMessage(`Ajouté au panier, sauf une partie de : ${unavailable.join(", ")} (stock insuffisant).`);
    } else router.push("/panier");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          {backHref && (
            <Link href={backHref} className="text-sm font-semibold text-muted hover:text-foreground">
              ← Mes commandes
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Commande {order.id}</h1>
          <p className="mt-1 text-muted">
            Passée le {longDate(order.createdAt)} · <StatusBadge status={status} />
          </p>
        </div>
      </div>

      {/* En-tête visible uniquement à l'impression : la page devient une facture. */}
      <div className="hidden print:block">
        <p className="font-display text-3xl font-extrabold">CRAAK! — Facture F-{order.id}</p>
        <p className="mt-1 text-sm">
          Date : {longDate(order.createdAt)} · Client : {order.address.firstName} {order.address.lastName} (
          {order.email})
        </p>
        <p className="mt-1 text-xs">Document de démonstration, sans valeur comptable. Montants TTC.</p>
      </div>

      <FormError>{error}</FormError>
      <FormSuccess>{message}</FormSuccess>

      <Card className="print:hidden">
        <h2 className="mb-5 font-display text-xl font-extrabold">Suivi</h2>
        <OrderTimeline order={order} status={status} />
        {shipped && (
          <p className="mt-5 text-sm">
            📦 Colis n° <strong className="font-mono">{order.trackingNumber}</strong> (transporteur simulé)
          </p>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-xl font-extrabold">Articles</h2>
        <ul className="divide-y-2 divide-dashed divide-foreground/15">
          {order.lines.map((l) => {
            const product = getProduct(l.slug);
            return (
              <li key={l.slug} className="flex items-center gap-4 py-3">
                {product && (
                  <ProductVisual
                    product={product}
                    className="size-14 shrink-0 rounded-lg border-2 border-foreground print:hidden"
                  />
                )}
                <div className="flex-1">
                  <p className="font-bold">{l.name}</p>
                  <p className="text-sm text-muted tabular-nums">
                    {l.quantity} × {formatPrice(l.unitPrice)}
                  </p>
                </div>
                <p className="font-bold tabular-nums">{formatPrice(l.total)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t-2 border-foreground pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Sous-total</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green">
              <dt>Remise ({order.promoCode})</dt>
              <dd className="tabular-nums">−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">{SHIPPING_OPTIONS.find((o) => o.id === order.shippingId)?.label}</dt>
            <dd className="tabular-nums">{order.shipping ? formatPrice(order.shipping) : "Offerte"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-lg font-extrabold">
            <dt>Total TTC</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold">Livraison</h2>
          <address className="mt-2 text-sm leading-relaxed not-italic">
            {order.address.firstName} {order.address.lastName}
            <br />
            {order.address.line1}
            {order.address.line2 && (
              <>
                <br />
                {order.address.line2}
              </>
            )}
            <br />
            {order.address.zip} {order.address.city}
          </address>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold">Paiement</h2>
          <p className="mt-2 text-sm">
            {order.payment.brand === "carte" ? "Carte" : order.payment.brand.toUpperCase()} •••• {order.payment.last4}
            {order.payment.threeDSecure && <span className="block text-muted">Authentifié 3-D Secure</span>}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <button type="button" onClick={reorder} className="btn bg-primary">
          🔁 Commander à nouveau
        </button>
        <button type="button" onClick={() => window.print()} className="btn bg-surface">
          🧾 Imprimer la facture
        </button>
        {isCancellable(order, now) && (
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              if (!confirm(`Annuler la commande ${order.id} ? Vous serez remboursé.`)) return;
              const cancelled = await run(() => cancelOrder(order.id, email));
              if (cancelled) {
                setOrder(cancelled);
                setMessage("Commande annulée. Le remboursement a été effectué (simulation).");
              }
            }}
            className="btn bg-surface text-sale"
          >
            {pending ? "Annulation…" : "Annuler la commande"}
          </button>
        )}
      </div>
    </div>
  );
}
