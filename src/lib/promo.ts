/**
 * Codes promo. Logique pure : le panier l'utilise pour l'aperçu, le backend pour le calcul
 * qui fait foi (le client ne décide jamais de sa remise).
 */

export type Promo = {
  code: string;
  label: string;
  /** Remise en centimes pour un sous-total donné. */
  discount: (subtotal: number) => number;
  freeShipping?: boolean;
  minSubtotal?: number;
  expiresAt?: string;
};

const PROMOS: Promo[] = [
  {
    code: "BIENVENUE10",
    label: "−10 % sur votre commande",
    discount: (subtotal) => Math.round(subtotal * 0.1),
  },
  {
    code: "CRAAK5",
    label: "−5 € dès 20 € d'achat",
    discount: () => 500,
    minSubtotal: 2000,
  },
  {
    code: "LIVRAISON",
    label: "Livraison offerte",
    discount: () => 0,
    freeShipping: true,
  },
  {
    code: "ETE2026",
    label: "−15 % (offre d'été)",
    discount: (subtotal) => Math.round(subtotal * 0.15),
    expiresAt: "2026-09-01T00:00:00.000Z",
  },
];

/** Codes affichés dans l'encart de démonstration. */
export const DEMO_PROMO_CODES = ["BIENVENUE10", "CRAAK5", "LIVRAISON"] as const;

export type PromoResult = { ok: true; promo: Promo } | { ok: false; error: string };

export function findPromo(code: string, subtotal: number, now = new Date()): PromoResult {
  const promo = PROMOS.find((p) => p.code === code.trim().toUpperCase());
  if (!promo) return { ok: false, error: "Ce code promo n'existe pas." };
  if (promo.expiresAt && now >= new Date(promo.expiresAt)) return { ok: false, error: "Ce code promo a expiré." };
  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    const min = (promo.minSubtotal / 100).toLocaleString("fr-FR");
    return { ok: false, error: `Ce code est valable dès ${min} € d'achat.` };
  }
  return { ok: true, promo };
}

/** Remise plafonnée au sous-total : une commande n'est jamais négative. */
export function promoDiscount(promo: Promo | null, subtotal: number) {
  return promo ? Math.min(promo.discount(subtotal), subtotal) : 0;
}
