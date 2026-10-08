import { addressProblem } from "./account";
import { isValidEmail, normalizeEmail, sessionUser } from "./auth";
import { randomId, randomToken } from "./crypto";
import { ApiError } from "./errors";
import { availableStock } from "./inventory";
import { network, readDb, updateDb } from "./store";
import type { Db, Order, OrderLine, PendingCheckout, ShippingAddress } from "./types";
import { cardBrand, DEMO_3DS_CODE, digitsOnly, paymentOutcome, validateCard, type CardInput } from "../card";
import { computeTotals, type CartItem } from "../cart-state";
import { getProduct, type ShippingId } from "../products";
import { findPromo } from "../promo";

const THREE_DS_TTL_MS = 10 * 60 * 1000;

export type CheckoutInput = {
  items: CartItem[];
  shippingId: ShippingId;
  promoCode: string | null;
  /** Obligatoire pour un invité ; ignoré si un client est connecté (on prend celui du compte). */
  email?: string;
  /** Une adresse du carnet (client connecté) ou une adresse saisie. */
  address: { addressId: string } | ShippingAddress;
  saveAddress?: boolean;
  card: CardInput;
};

export type CheckoutResult = { status: "succeeded"; order: Order } | { status: "requires_action"; checkoutId: string };

/** Lignes recalculées depuis le catalogue : le prix envoyé par le client n'est jamais utilisé. */
function priceLines(items: CartItem[], db: Db): OrderLine[] {
  if (items.length === 0) throw new ApiError("invalid_input", "Votre panier est vide.");
  return items.map(({ slug, quantity }) => {
    const product = getProduct(slug);
    if (!product) throw new ApiError("not_found", "Un produit de votre panier n'existe plus.");
    if (!Number.isInteger(quantity) || quantity < 1) throw new ApiError("invalid_input", "Quantité invalide.");
    const stock = availableStock(slug, db);
    if (quantity > stock) {
      throw new ApiError(
        "out_of_stock",
        stock === 0
          ? `« ${product.name} » vient d'être épuisé. Retirez-le de votre panier.`
          : `Il ne reste que ${stock} « ${product.name} » en stock.`,
      );
    }
    return { slug, name: product.name, unitPrice: product.price, quantity, total: product.price * quantity };
  });
}

function resolveAddress(input: CheckoutInput["address"], db: Db): ShippingAddress {
  if ("addressId" in input) {
    const found = sessionUser(db)?.addresses.find((a) => a.id === input.addressId);
    if (!found) throw new ApiError("not_found", "Cette adresse n'existe plus. Choisissez-en une autre.");
    return toShippingAddress(found);
  }
  const problem = addressProblem({ ...input, label: "" });
  if (problem) throw new ApiError("invalid_input", problem);
  return toShippingAddress(input);
}

function toShippingAddress(a: ShippingAddress): ShippingAddress {
  return {
    firstName: a.firstName.trim(),
    lastName: a.lastName.trim(),
    line1: a.line1.trim(),
    line2: a.line2?.trim() || undefined,
    zip: a.zip.trim(),
    city: a.city.trim(),
    phone: a.phone?.trim() || undefined,
  };
}

function newOrderId() {
  return `CRK-${Date.now().toString(36).toUpperCase()}${randomToken(1).toUpperCase()}`;
}

/** Enregistre la commande et décrémente le stock, après une dernière vérification du stock. */
function finalize(draft: PendingCheckout["order"], saveAddress: boolean): Order {
  return updateDb((db) => {
    priceLines(draft.lines, db); // le stock a pu partir pendant la validation 3-D Secure
    const order: Order = {
      ...draft,
      createdAt: new Date().toISOString(),
      trackingNumber: `6A${String(Math.floor(Math.random() * 1e11)).padStart(11, "0")}`,
      cancelledAt: null,
    };
    db.orders.push(order);
    for (const line of order.lines) db.sold[line.slug] = (db.sold[line.slug] ?? 0) + line.quantity;

    const user = order.userId ? db.users.find((u) => u.id === order.userId) : undefined;
    if (user && saveAddress) {
      user.addresses.push({
        id: randomId("adr"),
        label: "Adresse",
        ...order.address,
        isDefault: user.addresses.length === 0,
      });
    }
    return structuredClone(order);
  });
}

/**
 * Passe commande : revalide panier, stock, adresse et code promo, recalcule le total, puis
 * « débite » la carte. Si la banque demande une authentification 3-D Secure, rien n'est
 * enregistré tant que `confirmThreeDSecure` n'a pas abouti.
 */
export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  await network();
  const db = readDb();
  const user = sessionUser(db);
  const email = user?.email ?? normalizeEmail(input.email ?? "");
  if (!isValidEmail(email)) throw new ApiError("invalid_input", "Indiquez une adresse e-mail valide.");

  const lines = priceLines(input.items, db);
  const address = resolveAddress(input.address, db);
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);

  let promoCode: string | null = null;
  let promo = null;
  if (input.promoCode) {
    const found = findPromo(input.promoCode, subtotal);
    if (!found.ok) throw new ApiError("invalid_promo", found.error);
    promo = found.promo;
    promoCode = promo.code;
  }
  const totals = computeTotals(subtotal, input.shippingId, promo);

  const cardErrors = validateCard(input.card);
  const firstError = Object.values(cardErrors)[0];
  if (firstError) throw new ApiError("invalid_input", firstError);

  const outcome = paymentOutcome(input.card.number);
  if (outcome === "declined") {
    throw new ApiError("payment_failed", "Votre banque a refusé le paiement. Essayez une autre carte.");
  }
  if (outcome === "insufficient_funds") {
    throw new ApiError("payment_failed", "Paiement refusé : fonds insuffisants sur cette carte.");
  }

  const draft: PendingCheckout["order"] = {
    id: newOrderId(),
    userId: user?.id ?? null,
    email,
    address,
    shippingId: input.shippingId,
    lines,
    ...totals,
    promoCode,
    payment: {
      brand: cardBrand(input.card.number),
      last4: digitsOnly(input.card.number).slice(-4),
      threeDSecure: outcome === "requires_action",
    },
  };
  const saveAddress = !!input.saveAddress && !!user && !("addressId" in input.address);

  if (outcome === "requires_action") {
    const checkoutId = randomId("chk");
    updateDb((d) => {
      d.pendingCheckouts.push({
        id: checkoutId,
        order: draft,
        saveAddress,
        expiresAt: new Date(Date.now() + THREE_DS_TTL_MS).toISOString(),
      });
    });
    return { status: "requires_action", checkoutId };
  }
  return { status: "succeeded", order: finalize(draft, saveAddress) };
}

function pendingCheckout(checkoutId: string) {
  const pending = readDb().pendingCheckouts.find((p) => p.id === checkoutId);
  if (!pending || new Date(pending.expiresAt).getTime() < Date.now()) {
    throw new ApiError("invalid_token", "La session de paiement a expiré. Recommencez le paiement.");
  }
  return pending;
}

/** Validation 3-D Secure : le bon code finalise la commande, un mauvais code la laisse en attente. */
export async function confirmThreeDSecure(checkoutId: string, code: string): Promise<Order> {
  await network();
  const pending = pendingCheckout(checkoutId);
  if (code.trim() !== DEMO_3DS_CODE) {
    throw new ApiError("payment_failed", "Code incorrect : votre banque n'a pas autorisé le paiement.");
  }
  updateDb((db) => {
    db.pendingCheckouts = db.pendingCheckouts.filter((p) => p.id !== checkoutId);
  });
  return finalize(pending.order, pending.saveAddress);
}

/** Le client abandonne l'authentification : la commande en attente est oubliée. */
export async function cancelThreeDSecure(checkoutId: string) {
  await network();
  updateDb((db) => {
    db.pendingCheckouts = db.pendingCheckouts.filter((p) => p.id !== checkoutId);
  });
}

/** Une commande n'est visible que par son client (compte) ou avec l'e-mail utilisé (invité). */
export async function getOrder(id: string, email?: string): Promise<Order> {
  await network();
  const db = readDb();
  const order = db.orders.find((o) => o.id === id.trim().toUpperCase());
  const user = sessionUser(db);
  // Numéro + e-mail suffisent (comme un suivi de colis) ; sinon, il faut être le client du compte.
  const allowed =
    order && ((user && order.userId === user.id) || (email !== undefined && normalizeEmail(email) === order.email));
  if (!order || !allowed) throw new ApiError("not_found", "Aucune commande ne correspond à ces informations.");
  return structuredClone(order);
}
