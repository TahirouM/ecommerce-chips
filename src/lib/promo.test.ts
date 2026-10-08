import { describe, expect, it } from "vitest";
import { computeTotals } from "./cart-state";
import { findPromo, promoDiscount } from "./promo";

const promo = (code: string, subtotal = 5000, now?: Date) => {
  const result = findPromo(code, subtotal, now);
  if (!result.ok) throw new Error(result.error);
  return result.promo;
};

describe("findPromo", () => {
  it("reconnaît un code, quelle que soit la casse et les espaces", () => {
    expect(findPromo(" bienvenue10 ", 1000)).toMatchObject({ ok: true, promo: { code: "BIENVENUE10" } });
  });

  it("refuse un code inconnu", () => {
    expect(findPromo("GRATUIT", 1000)).toEqual({ ok: false, error: "Ce code promo n'existe pas." });
  });

  it("refuse un code expiré", () => {
    expect(findPromo("ETE2026", 5000, new Date("2026-10-01"))).toEqual({ ok: false, error: "Ce code promo a expiré." });
    expect(findPromo("ETE2026", 5000, new Date("2026-08-01")).ok).toBe(true);
  });

  it("applique le minimum d'achat", () => {
    expect(findPromo("CRAAK5", 1999)).toEqual({ ok: false, error: "Ce code est valable dès 20 € d'achat." });
    expect(findPromo("CRAAK5", 2000).ok).toBe(true);
  });
});

describe("promoDiscount", () => {
  it("calcule un pourcentage arrondi au centime", () => {
    expect(promoDiscount(promo("BIENVENUE10"), 1245)).toBe(125);
  });

  it("ne dépasse jamais le sous-total", () => {
    expect(promoDiscount(promo("CRAAK5", 2000), 300)).toBe(300);
  });

  it("vaut 0 sans code", () => {
    expect(promoDiscount(null, 5000)).toBe(0);
  });
});

describe("computeTotals", () => {
  it("additionne sous-total, remise et livraison", () => {
    expect(computeTotals(2000, "standard")).toEqual({ subtotal: 2000, discount: 0, shipping: 490, total: 2490 });
  });

  it("apprécie le seuil de livraison offerte APRÈS remise", () => {
    // 36 € − 10 % = 32,40 € : sous le seuil de 35 €, la livraison redevient payante.
    expect(computeTotals(3600, "standard", promo("BIENVENUE10"))).toEqual({
      subtotal: 3600,
      discount: 360,
      shipping: 490,
      total: 3730,
    });
  });

  it("offre aussi l'express avec le code LIVRAISON", () => {
    expect(computeTotals(1000, "express", promo("LIVRAISON"))).toMatchObject({ shipping: 0, total: 1000 });
  });
});
