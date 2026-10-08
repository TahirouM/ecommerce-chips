import type { Db, Order, UserRecord } from "./types";
import { computeTotals } from "../cart-state";
import { getProduct, type ShippingId } from "../products";
import { findPromo } from "../promo";

/** Compte de démonstration, affiché sur la page de connexion. */
export const DEMO_ACCOUNT = { email: "demo@craak.fr", password: "chips2026" } as const;

// Hash PBKDF2 précalculé de DEMO_ACCOUNT.password (le seed doit rester synchrone).
const demoUser: UserRecord = {
  id: "usr_demo",
  email: DEMO_ACCOUNT.email,
  firstName: "Alex",
  lastName: "Martin",
  salt: "c7a1f0d2e9b84a3f6d5e2c1b0a9f8e7d",
  passwordHash: "7d0bba59a723f566c4bd5d33f53d850b47fd786b0b096680beddca65e66289f6",
  createdAt: "2026-09-01T10:00:00.000Z",
  addresses: [
    {
      id: "adr_demo_maison",
      label: "Maison",
      firstName: "Alex",
      lastName: "Martin",
      line1: "12 rue des Patates",
      zip: "75011",
      city: "Paris",
      phone: "06 12 34 56 78",
      isDefault: true,
    },
    {
      id: "adr_demo_bureau",
      label: "Bureau",
      firstName: "Alex",
      lastName: "Martin",
      line1: "48 avenue du Croustillant",
      line2: "3e étage",
      zip: "69002",
      city: "Lyon",
      isDefault: false,
    },
  ],
  favorites: ["truffe-noire", "paprika-fume", "habanero-extreme"],
};

const DAY = 24 * 60 * 60 * 1000;

/** Commande passée du compte démo, chiffrée avec les mêmes règles qu'une vraie commande. */
function demoOrder(
  id: string,
  daysAgo: number,
  items: [slug: string, quantity: number][],
  shippingId: ShippingId,
  options: { promoCode?: string; cancelled?: boolean; addressIndex?: 0 | 1 } = {},
): Order {
  const lines = items.map(([slug, quantity]) => {
    const product = getProduct(slug)!;
    return { slug, name: product.name, unitPrice: product.price, quantity, total: product.price * quantity };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const promo = options.promoCode ? findPromo(options.promoCode, subtotal, new Date(0)) : null;
  const createdAt = new Date(Date.now() - daysAgo * DAY);
  const a = demoUser.addresses[options.addressIndex ?? 0];
  const address = {
    firstName: a.firstName,
    lastName: a.lastName,
    line1: a.line1,
    line2: a.line2,
    zip: a.zip,
    city: a.city,
  };
  return {
    id,
    userId: demoUser.id,
    email: demoUser.email,
    createdAt: createdAt.toISOString(),
    address,
    shippingId,
    lines,
    ...computeTotals(subtotal, shippingId, promo?.ok ? promo.promo : null),
    promoCode: promo?.ok ? promo.promo.code : null,
    payment: { brand: "visa", last4: "4242", threeDSecure: false },
    trackingNumber: `6A${id.replace(/\D/g, "").padStart(11, "0")}`,
    cancelledAt: options.cancelled ? new Date(createdAt.getTime() + 60_000).toISOString() : null,
  };
}

export function seedDb(version: number): Db {
  return {
    version,
    users: [structuredClone(demoUser)],
    sessions: [],
    resetTokens: [],
    guestFavorites: [],
    orders: [
      demoOrder(
        "CRK-DEMO3",
        6,
        [
          ["sel-de-mer", 2],
          ["paprika-fume", 1],
          ["creme-oignon", 2],
        ],
        "standard",
      ),
      demoOrder("CRK-DEMO2", 21, [["truffe-noire", 1]], "express", { cancelled: true }),
      demoOrder(
        "CRK-DEMO1",
        38,
        [
          ["box-decouverte", 2],
          ["habanero-extreme", 1],
        ],
        "standard",
        {
          promoCode: "BIENVENUE10",
          addressIndex: 1,
        },
      ),
    ],
    pendingCheckouts: [],
    sold: {},
  };
}
