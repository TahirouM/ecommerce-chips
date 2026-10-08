"use client";

import { useState } from "react";
import { getOrder, type Order } from "@/lib/backend";
import { useAsyncAction } from "@/lib/use-async-action";
import { Card, Field, FormError, SubmitButton } from "../ui/form";
import { OrderDetail } from "./order-detail";

/** Suivi sans compte : numéro de commande + e-mail utilisé pour commander. */
export function TrackOrder() {
  const [found, setFound] = useState<{ order: Order; email: string } | null>(null);
  const { pending, error, run } = useAsyncAction();

  if (found) {
    return (
      <>
        <OrderDetail order={found.order} email={found.email} />
        <button
          type="button"
          onClick={() => setFound(null)}
          className="mt-8 text-sm font-bold underline underline-offset-4 print:hidden"
        >
          Suivre une autre commande
        </button>
      </>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const email = String(data.get("email"));
          const order = await run(() => getOrder(String(data.get("id")), email));
          if (order) setFound({ order, email });
        }}
      >
        <FormError>{error}</FormError>
        <Field label="Numéro de commande" name="id" placeholder="CRK-…" required autoComplete="off" />
        <Field label="Adresse e-mail de la commande" name="email" type="email" autoComplete="email" required />
        <SubmitButton pending={pending} pendingLabel="Recherche…">
          Suivre ma commande
        </SubmitButton>
      </form>
    </Card>
  );
}
