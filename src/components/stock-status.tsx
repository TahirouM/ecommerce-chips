"use client";

import { useAvailableStock } from "@/lib/backend/hooks";

/** État du stock, recalculé après chaque vente (le HTML pré-rendu montre le stock du catalogue). */
export function StockStatus({ slug }: { slug: string }) {
  const stock = useAvailableStock(slug);
  return (
    <p className="mt-6 text-sm font-semibold">
      {stock === 0 ? (
        <span className="text-sale">● Victime de son succès — bientôt de retour</span>
      ) : stock < 10 ? (
        <span className="text-orange">● Plus que {stock} en stock, faites vite !</span>
      ) : (
        <span className="text-green">● En stock — expédié sous 24 h</span>
      )}
    </p>
  );
}
