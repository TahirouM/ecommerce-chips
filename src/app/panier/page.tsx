import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Panier" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Votre panier 🛒</h1>
      <CartView />
    </div>
  );
}
