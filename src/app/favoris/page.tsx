import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites-view";

export const metadata: Metadata = { title: "Mes favoris" };

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Mes favoris 💛</h1>
      <p className="mt-2 text-lg text-muted">Les saveurs que vous avez mises de côté.</p>
      <div className="mt-10">
        <FavoritesView />
      </div>
    </div>
  );
}
