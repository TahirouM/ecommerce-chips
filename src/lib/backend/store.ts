import { seedDb } from "./seed";
import type { Db } from "./types";

/**
 * « Base de données » du backend simulé : un document JSON dans localStorage.
 * Le jeton de session vit à part, comme le ferait un cookie côté navigateur.
 * Changer la forme de `Db` impose d'incrémenter DB_VERSION : la démo repart alors du seed.
 */

const DB_KEY = "craak-db";
const SESSION_KEY = "craak-session";
export const DB_VERSION = 4;

const listeners = new Set<() => void>();
let cache: Db | null = null;

export function readDb(): Db {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) ?? "null");
    cache = parsed?.version === DB_VERSION ? parsed : seedDb(DB_VERSION);
  } catch {
    cache = seedDb(DB_VERSION);
  }
  return cache!;
}

/** Applique une mutation sur une copie de la base, puis la persiste et notifie les abonnés. */
export function updateDb<T>(mutate: (db: Db) => T): T {
  const next = structuredClone(readDb());
  const result = mutate(next);
  cache = next;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(next));
  } catch {}
  notify();
  return result;
}

export function getSessionToken() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null) {
  try {
    if (token) localStorage.setItem(SESSION_KEY, token);
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
  notify();
}

export function resetDb() {
  cache = null;
  try {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {}
  notify();
}

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeDb(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== DB_KEY && e.key !== SESSION_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Latence réseau simulée, pour que l'interface gère de vrais états de chargement. */
export function network() {
  if (process.env.NODE_ENV === "test") return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
}
