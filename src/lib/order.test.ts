import { describe, expect, it } from "vitest";
import { summarize } from "./cart-state";
import { loadOrder, newOrderId, type Order, saveOrder, toOrderLines } from "./order";

describe("newOrderId", () => {
  it("produit un identifiant lisible préfixé CRK-", () => {
    expect(newOrderId()).toMatch(/^CRK-[0-9A-Z]+$/);
  });
});

describe("toOrderLines", () => {
  it("fige le nom, la quantité et le total de chaque ligne", () => {
    const { lines } = summarize([{ slug: "sel-de-mer", quantity: 3 }]);
    expect(toOrderLines(lines)).toEqual([{ name: "Sel de mer", quantity: 3, total: 747 }]);
  });
});

describe("saveOrder / loadOrder", () => {
  const order: Order = {
    id: "CRK-TEST",
    email: "client@example.com",
    name: "Camille Martin",
    address: "1 rue des Lilas, 75011 Paris",
    lines: [{ name: "Sel de mer", quantity: 1, total: 249 }],
    shipping: 490,
    total: 739,
  };

  it("relit la dernière commande enregistrée", () => {
    saveOrder(order);
    expect(loadOrder()).toEqual(order);
  });

  it("renvoie null sans commande ou si la donnée est corrompue", () => {
    expect(loadOrder()).toBeNull();
    sessionStorage.setItem("craak-last-order", "{oups");
    expect(loadOrder()).toBeNull();
  });
});
