import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/checkout";

export const metadata: Metadata = { title: "Commande" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Commande</h1>
      <p className="mt-2 text-muted">🔒 Paiement simulé : aucune somme n&apos;est débitée.</p>
      <Checkout />
    </div>
  );
}
