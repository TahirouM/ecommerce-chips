"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/backend/hooks";

export function FavoritesLink() {
  const count = useFavorites().length;
  return (
    <Link
      href="/favoris"
      aria-label={`Mes favoris (${count})`}
      className="relative flex size-11 items-center justify-center rounded-full text-xl hover:bg-primary"
    >
      <span aria-hidden>♡</span>
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-5 rounded-full bg-accent px-1 text-center text-[11px] leading-5 font-bold text-white tabular-nums">
          {count}
        </span>
      )}
    </Link>
  );
}
