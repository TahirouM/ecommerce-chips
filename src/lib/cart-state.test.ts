import { describe, expect, it } from "vitest";
import {
  addItem,
  type CartItem,
  clampQuantity,
  parseCart,
  removeItem,
  setItemQuantity,
  shippingCost,
  summarize,
} from "./cart-state";
import { FREE_SHIPPING_THRESHOLD, getProduct } from "./products";

// Produits de référence du catalogue : stocks et prix connus.
const SEL = "sel-de-mer"; // 2,49 €, stock 80
const HABANERO = "habanero-extreme"; // 3,49 €, stock 6
const EPUISE = "poulet-roti"; // stock 0

describe("clampQuantity", () => {
  it("borne la quantité entre 0 et le stock", () => {
    expect(clampQuantity(HABANERO, 3)).toBe(3);
    expect(clampQuantity(HABANERO, 99)).toBe(6);
    expect(clampQuantity(HABANERO, -2)).toBe(0);
  });

  it("renvoie 0 pour un produit inconnu", () => {
    expect(clampQuantity("n-existe-pas", 5)).toBe(0);
  });
});

describe("addItem", () => {
  it("ajoute un nouveau produit", () => {
    expect(addItem([], SEL, 2)).toEqual([{ slug: SEL, quantity: 2 }]);
  });

  it("cumule les quantités d'un produit déjà présent", () => {
    expect(addItem([{ slug: SEL, quantity: 2 }], SEL, 3)).toEqual([{ slug: SEL, quantity: 5 }]);
  });

  it("ne dépasse jamais le stock", () => {
    expect(addItem([{ slug: HABANERO, quantity: 5 }], HABANERO, 4)).toEqual([{ slug: HABANERO, quantity: 6 }]);
  });

  it("n'ajoute pas un produit épuisé et renvoie le même panier", () => {
    const items: CartItem[] = [];
    expect(addItem(items, EPUISE)).toBe(items);
  });

  it("ne modifie pas le panier d'origine (immutabilité)", () => {
    const items: CartItem[] = [{ slug: SEL, quantity: 1 }];
    addItem(items, SEL, 1);
    expect(items).toEqual([{ slug: SEL, quantity: 1 }]);
  });
});

describe("setItemQuantity / removeItem", () => {
  const items: CartItem[] = [
    { slug: SEL, quantity: 2 },
    { slug: HABANERO, quantity: 1 },
  ];

  it("met à jour la quantité en respectant le stock", () => {
    expect(setItemQuantity(items, HABANERO, 50)).toContainEqual({ slug: HABANERO, quantity: 6 });
  });

  it("retire la ligne quand la quantité tombe à 0", () => {
    expect(setItemQuantity(items, SEL, 0)).toEqual([{ slug: HABANERO, quantity: 1 }]);
  });

  it("retire un produit", () => {
    expect(removeItem(items, HABANERO)).toEqual([{ slug: SEL, quantity: 2 }]);
  });
});

describe("parseCart", () => {
  it("relit un panier sauvegardé", () => {
    expect(parseCart(JSON.stringify([{ slug: SEL, quantity: 2 }]))).toEqual([{ slug: SEL, quantity: 2 }]);
  });

  it("écarte les produits retirés du catalogue", () => {
    expect(parseCart(JSON.stringify([{ slug: "ancienne-saveur", quantity: 1 }]))).toEqual([]);
  });

  it.each([null, "", "pas du json", "{}", "42"])("renvoie un panier vide pour %j", (raw) => {
    expect(parseCart(raw)).toEqual([]);
  });
});

describe("summarize", () => {
  it("calcule lignes, nombre d'articles et sous-total en centimes", () => {
    const { lines, count, subtotal } = summarize([
      { slug: SEL, quantity: 2 },
      { slug: HABANERO, quantity: 1 },
    ]);
    expect(lines.map((l) => l.total)).toEqual([498, 349]);
    expect(count).toBe(3);
    expect(subtotal).toBe(847);
  });

  it("débloque la livraison offerte pile au seuil", () => {
    const price = getProduct("box-decouverte")!.price; // 13,90 €
    const under = Math.floor(FREE_SHIPPING_THRESHOLD / price);
    expect(summarize([{ slug: "box-decouverte", quantity: under }]).freeShipping).toBe(false);
    expect(summarize([{ slug: "box-decouverte", quantity: under + 1 }]).freeShipping).toBe(true);
  });
});

describe("shippingCost", () => {
  it("facture la livraison sous le seuil", () => {
    expect(shippingCost(FREE_SHIPPING_THRESHOLD - 1, "standard")).toBe(490);
    expect(shippingCost(FREE_SHIPPING_THRESHOLD - 1, "express")).toBe(890);
  });

  it("offre la livraison standard à partir du seuil", () => {
    expect(shippingCost(FREE_SHIPPING_THRESHOLD, "standard")).toBe(0);
  });

  it("facture toujours l'express, même au-delà du seuil", () => {
    expect(shippingCost(FREE_SHIPPING_THRESHOLD + 5000, "express")).toBe(890);
  });
});
