"use client";

import { toggleFavorite } from "@/lib/backend";
import { useFavorites } from "@/lib/backend/hooks";

export function FavoriteButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const active = useFavorites().includes(slug);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-foreground text-xl transition hover:scale-110 ${
        active ? "bg-accent text-white" : "bg-surface text-foreground"
      } ${className}`}
    >
      <span aria-hidden>{active ? "♥" : "♡"}</span>
    </button>
  );
}
