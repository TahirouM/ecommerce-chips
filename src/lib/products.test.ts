import { describe, expect, it } from "vitest";
import { categories, formatPrice, formatWeight, getProduct, pricePerKg, products } from "./products";

// Intl insère des espaces insécables : on les normalise pour des assertions lisibles.
const plain = (s: string) => s.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formate des centimes en euros, à la française", () => {
    expect(plain(formatPrice(249))).toBe("2,49 €");
    expect(plain(formatPrice(1390))).toBe("13,90 €");
    expect(plain(formatPrice(0))).toBe("0,00 €");
  });
});

describe("pricePerKg", () => {
  it("ramène le prix au kilo et l'arrondit au centime", () => {
    // 2,49 € les 150 g → 16,60 €/kg
    expect(plain(pricePerKg(getProduct("sel-de-mer")!))).toBe("16,60 €");
  });
});

describe("formatWeight", () => {
  it("affiche les grammes sous 1 kg et les kilos au-delà", () => {
    expect(formatWeight(150)).toBe("150 g");
    expect(formatWeight(1000)).toBe("1 kg");
    expect(formatWeight(1800)).toBe("1,8 kg");
  });
});

describe("catalogue", () => {
  it("n'a pas deux produits avec le même slug", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("rattache chaque produit à un univers existant", () => {
    const known = new Set(categories.map((c) => c.slug));
    for (const p of products) expect(known, p.slug).toContain(p.category);
  });

  it("stocke des prix et stocks entiers et positifs (centimes, cf. ADR 0002)", () => {
    for (const p of products) {
      expect(Number.isInteger(p.price) && p.price > 0, p.slug).toBe(true);
      expect(Number.isInteger(p.stock) && p.stock >= 0, p.slug).toBe(true);
      if (p.compareAtPrice) expect(p.compareAtPrice, p.slug).toBeGreaterThan(p.price);
    }
  });
});
