import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/order-confirmation";

export const metadata: Metadata = { title: "Commande confirmée" };

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <OrderConfirmation />
    </div>
  );
}
