import { normalizeEmail, requireUser, sessionUser } from "./auth";
import { ApiError } from "./errors";
import { network, readDb, updateDb } from "./store";
import type { Db, Order } from "./types";
import { isCancellable } from "../order-status";

/** Commandes du client connecté, de la plus récente à la plus ancienne. */
export async function listMyOrders(): Promise<Order[]> {
  await network();
  const user = requireUser();
  return structuredClone(
    readDb()
      .orders.filter((o) => o.userId === user.id)
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

function canAccess(db: Db, order: Order, email?: string) {
  const user = sessionUser(db);
  return (user && order.userId === user.id) || (email !== undefined && normalizeEmail(email) === order.email);
}

/**
 * Annule une commande non expédiée : le stock est restitué et le paiement « remboursé ».
 * Accessible au client du compte, ou à l'invité qui fournit l'e-mail de la commande.
 */
export async function cancelOrder(id: string, email?: string): Promise<Order> {
  await network();
  return updateDb((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order || !canAccess(db, order, email)) {
      throw new ApiError("not_found", "Aucune commande ne correspond à ces informations.");
    }
    if (!isCancellable(order)) {
      throw new ApiError(
        "not_cancellable",
        order.cancelledAt
          ? "Cette commande est déjà annulée."
          : "Le colis est déjà parti : la commande ne peut plus être annulée.",
      );
    }
    order.cancelledAt = new Date().toISOString();
    for (const line of order.lines) db.sold[line.slug] = Math.max(0, (db.sold[line.slug] ?? 0) - line.quantity);
    return structuredClone(order);
  });
}
