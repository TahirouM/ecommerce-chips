"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { errorMessage, getOrder, type Order } from "@/lib/backend";
import { FormError } from "../ui/form";
import { OrderDetail } from "./order-detail";

export function MyOrderDetail() {
  const id = useSearchParams().get("id") ?? "";
  const [state, setState] = useState<{ id: string; order?: Order; error?: string } | null>(null);

  useEffect(() => {
    getOrder(id)
      .then((order) => setState({ id, order }))
      .catch((e) => setState({ id, error: errorMessage(e) }));
  }, [id]);

  if (state?.id !== id) return <div className="h-96 animate-pulse rounded-2xl bg-soft" aria-hidden />;
  if (!state.order) {
    return (
      <div className="space-y-6">
        <FormError>{state.error}</FormError>
        <Link href="/compte/commandes" className="btn bg-surface">
          ← Mes commandes
        </Link>
      </div>
    );
  }
  return <OrderDetail order={state.order} backHref="/compte/commandes" />;
}
