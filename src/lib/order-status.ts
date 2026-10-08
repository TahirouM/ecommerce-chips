/**
 * Statut d'une commande, simulé à partir de l'heure de commande (accéléré pour la démo :
 * quelques minutes au lieu de quelques jours). Logique pure, testée.
 */

export type OrderStatus = "confirmee" | "preparation" | "expediee" | "livree" | "annulee";

const MINUTE = 60_000;

/** Début de chaque étape, en minutes après la commande. */
export const STATUS_STEPS = [
  { status: "confirmee", label: "Confirmée", after: 0 },
  { status: "preparation", label: "En préparation", after: 2 },
  { status: "expediee", label: "Expédiée", after: 5 },
  { status: "livree", label: "Livrée", after: 10 },
] as const satisfies readonly { status: OrderStatus; label: string; after: number }[];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmee: "Confirmée",
  preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

type Timed = { createdAt: string; cancelledAt: string | null };

export function orderStatus(order: Timed, now = new Date()): OrderStatus {
  if (order.cancelledAt) return "annulee";
  const minutes = (now.getTime() - new Date(order.createdAt).getTime()) / MINUTE;
  return [...STATUS_STEPS].reverse().find((s) => minutes >= s.after)?.status ?? "confirmee";
}

/** Date (simulée) à laquelle une étape a été atteinte. */
export function stepDate(order: Timed, after: number) {
  return new Date(new Date(order.createdAt).getTime() + after * MINUTE);
}

/** On peut annuler tant que le colis n'est pas parti. */
export function isCancellable(order: Timed, now = new Date()) {
  const status = orderStatus(order, now);
  return status === "confirmee" || status === "preparation";
}
