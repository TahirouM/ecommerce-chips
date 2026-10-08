"use client";

import { useRouter } from "next/navigation";
import { resetDemo } from "@/lib/backend";
import { cart } from "@/lib/cart";

export function ResetDemoButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (!confirm("Effacer comptes, commandes et panier de cette démo ?")) return;
        resetDemo();
        cart.clear();
        router.push("/");
      }}
      className="underline underline-offset-4 hover:text-primary"
    >
      Réinitialiser la démo
    </button>
  );
}
