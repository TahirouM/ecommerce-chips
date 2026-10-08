"use client";

import { useSyncExternalStore } from "react";
import { getProduct } from "../products";
import { currentFavorites } from "./account";
import { availableStock } from "./inventory";
import { sessionUser, toPublicUser } from "./auth";
import { readDb, subscribeDb, getSessionToken } from "./store";
import type { PublicUser } from "./types";

let cached: { db: unknown; token: string | null; user: PublicUser | null } | null = null;

// Instantané stable tant que la base et la session n'ont pas changé (exigé par useSyncExternalStore).
function snapshot(): PublicUser | null {
  const db = readDb();
  const token = getSessionToken();
  if (cached?.db !== db || cached.token !== token) {
    const user = sessionUser(db);
    cached = { db, token, user: user && toPublicUser(user) };
  }
  return cached.user;
}

/**
 * Utilisateur connecté. `undefined` pendant le rendu serveur et l'hydratation (on ne sait
 * pas encore), `null` si personne n'est connecté.
 */
export function useSession(): PublicUser | null | undefined {
  return useSyncExternalStore(subscribeDb, snapshot, () => undefined);
}

const NO_FAVORITES: string[] = [];

/** Slugs des produits favoris (compte connecté ou visiteur). Vide pendant le rendu serveur. */
export function useFavorites(): string[] {
  return useSyncExternalStore(
    subscribeDb,
    () => currentFavorites(),
    () => NO_FAVORITES,
  );
}

/** Stock disponible d'un produit ; pendant le rendu serveur, celui du catalogue. */
export function useAvailableStock(slug: string): number {
  return useSyncExternalStore(
    subscribeDb,
    () => availableStock(slug),
    () => getProduct(slug)?.stock ?? 0,
  );
}
