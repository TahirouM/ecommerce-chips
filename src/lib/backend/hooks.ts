"use client";

import { useSyncExternalStore } from "react";
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
