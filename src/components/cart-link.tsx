"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/panier" className="btn bg-surface px-4 py-2 text-sm">
      <span aria-hidden>🛒</span>
      Panier
      <span
        className="min-w-6 rounded-full bg-accent px-1.5 text-center text-xs font-bold leading-6 text-accent-foreground tabular-nums"
        aria-label={`${count} article${count > 1 ? "s" : ""}`}
      >
        {count}
      </span>
    </Link>
  );
}
