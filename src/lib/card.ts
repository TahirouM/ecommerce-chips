/**
 * Validation d'une carte bancaire, sans dépendance. En production, ces données ne
 * transiteraient jamais par notre code : le prestataire (Stripe…) fournit le formulaire.
 */

export type CardInput = { name: string; number: string; expiry: string; cvc: string };
export type CardErrors = Partial<Record<keyof CardInput, string>>;
export type CardBrand = "visa" | "mastercard" | "amex" | "carte";

export const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Algorithme de Luhn : détecte les fautes de frappe dans un numéro de carte. */
export function luhnValid(number: string) {
  const digits = digitsOnly(number);
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function cardBrand(number: string): CardBrand {
  const d = digitsOnly(number);
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return "carte";
}

/** « 4242424242424242 » → « 4242 4242 4242 4242 » (saisie plus lisible). */
export function formatCardNumber(value: string) {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** « 1228 » → « 12/28 ». */
export function formatExpiry(value: string) {
  const d = digitsOnly(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function validateCard(card: CardInput, now = new Date()): CardErrors {
  const errors: CardErrors = {};
  if (!card.name.trim()) errors.name = "Indiquez le nom inscrit sur la carte.";
  if (!luhnValid(card.number)) errors.number = "Ce numéro de carte n'est pas valide.";

  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry.trim());
  const month = match ? Number(match[1]) : 0;
  if (!match || month < 1 || month > 12) errors.expiry = "Format attendu : MM/AA.";
  else {
    // La carte reste valable jusqu'au dernier jour de son mois d'expiration.
    const end = new Date(2000 + Number(match[2]), month, 1);
    if (end <= now) errors.expiry = "Cette carte a expiré.";
  }

  const cvcLength = cardBrand(card.number) === "amex" ? 4 : 3;
  if (digitsOnly(card.cvc).length !== cvcLength || card.cvc.trim().length !== cvcLength)
    errors.cvc = `Le cryptogramme comporte ${cvcLength} chiffres.`;
  return errors;
}

/** Cartes de test (même principe que Stripe) : le numéro choisit l'issue du paiement. */
export const TEST_CARDS = [
  { number: "4242 4242 4242 4242", outcome: "succeeded", label: "Paiement accepté" },
  { number: "4000 0027 6000 3184", outcome: "requires_action", label: "Authentification 3-D Secure" },
  { number: "4000 0000 0000 0002", outcome: "declined", label: "Carte refusée" },
  { number: "4000 0000 0000 9995", outcome: "insufficient_funds", label: "Fonds insuffisants" },
] as const;

export type PaymentOutcome = (typeof TEST_CARDS)[number]["outcome"];

/** Issue simulée d'un paiement : toute autre carte valide est acceptée. */
export function paymentOutcome(number: string): PaymentOutcome {
  return TEST_CARDS.find((c) => digitsOnly(c.number) === digitsOnly(number))?.outcome ?? "succeeded";
}

/** Code de validation 3-D Secure attendu par la « banque » de démonstration. */
export const DEMO_3DS_CODE = "123456";
