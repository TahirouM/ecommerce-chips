/**
 * Référence de la dernière commande passée dans cet onglet, pour la page de confirmation.
 * On ne garde que l'identifiant et l'e-mail : la commande elle-même est relue au backend.
 */

const KEY = "craak-last-order";

export type LastOrder = { id: string; email: string };

export function saveLastOrder(order: LastOrder) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {}
}

/** Valeur brute (chaîne stable, utilisable comme instantané par useSyncExternalStore). */
export function readLastOrderRaw() {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function parseLastOrder(raw: string): LastOrder | null {
  try {
    const parsed = JSON.parse(raw || "null");
    return typeof parsed?.id === "string" && typeof parsed?.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function loadLastOrder() {
  return parseLastOrder(readLastOrderRaw());
}
