"use client";

import Link from "next/link";
import { useFavorites, useSession } from "@/lib/backend/hooks";
import { getProduct, type Product } from "@/lib/products";
import { ProductGrid } from "./product-card";

export function FavoritesView() {
  const favorites = useFavorites();
  const user = useSession();
  const products = favorites.map(getProduct).filter((p): p is Product => !!p);

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-6xl">💛</p>
        <p className="mt-4 text-lg text-muted">
          Aucun favori pour l&apos;instant. Touchez le ♡ d&apos;une saveur pour la garder ici.
        </p>
        <Link href="/produits" className="mt-8 btn bg-primary">
          Découvrir les saveurs
        </Link>
      </div>
    );
  }

  return (
    <>
      {user === null && (
        <p className="mb-8 rounded-xl border-2 border-dashed border-foreground/40 bg-primary/15 px-4 py-3 text-sm">
          Ces favoris sont gardés sur cet appareil.{" "}
          <Link href="/connexion?retour=%2Ffavoris" className="font-bold underline underline-offset-4">
            Connectez-vous
          </Link>{" "}
          pour les rattacher à votre compte.
        </p>
      )}
      <ProductGrid products={products} />
    </>
  );
}
