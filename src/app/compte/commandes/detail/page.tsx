import type { Metadata } from "next";
import { Suspense } from "react";
import { MyOrderDetail } from "@/components/orders/my-order-detail";

export const metadata: Metadata = { title: "Détail de la commande" };

export default function Page() {
  return (
    // L'identifiant vient de ?id= : rendu côté client, sous Suspense.
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-soft" aria-hidden />}>
      <MyOrderDetail />
    </Suspense>
  );
}
