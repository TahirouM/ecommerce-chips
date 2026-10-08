import { beforeEach, describe, expect, it } from "vitest";
import { login, logout, register } from "./auth";
import { placeOrder, type CheckoutInput } from "./checkout";
import { availableStock } from "./inventory";
import { cancelOrder, listMyOrders } from "./orders";
import { DEMO_ACCOUNT } from "./seed";
import { resetDb } from "./store";

const commandeInvite: CheckoutInput = {
  items: [{ slug: "habanero-extreme", quantity: 2 }],
  shippingId: "standard",
  promoCode: null,
  email: "camille@example.com",
  address: { firstName: "Camille", lastName: "Durand", line1: "3 place des Frites", zip: "13001", city: "Marseille" },
  card: { name: "Camille Durand", number: "4242 4242 4242 4242", expiry: "12/30", cvc: "123" },
};

async function passerCommande(input = commandeInvite) {
  const result = await placeOrder(input);
  if (result.status !== "succeeded") throw new Error("paiement attendu");
  return result.order;
}

beforeEach(() => resetDb());

describe("listMyOrders", () => {
  it("exige d'être connecté", async () => {
    await expect(listMyOrders()).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("liste les commandes du compte, la plus récente d'abord", async () => {
    await login(DEMO_ACCOUNT);
    const orders = await listMyOrders();
    expect(orders.map((o) => o.id)).toEqual(["CRK-DEMO3", "CRK-DEMO2", "CRK-DEMO1"]);
  });

  it("chiffre les commandes de démo avec les vraies règles (code promo compris)", async () => {
    await login(DEMO_ACCOUNT);
    const demo1 = (await listMyOrders()).find((o) => o.id === "CRK-DEMO1")!;
    // 2 × 13,90 € + 3,49 € = 31,29 € ; −10 % = −3,13 € ; 28,16 € < 35 € : livraison 4,90 €
    expect(demo1).toMatchObject({ subtotal: 3129, discount: 313, shipping: 490, total: 3306 });
  });
});

describe("cancelOrder", () => {
  it("annule une commande non expédiée et restitue le stock", async () => {
    const order = await passerCommande();
    expect(availableStock("habanero-extreme")).toBe(4);
    const cancelled = await cancelOrder(order.id, "CAMILLE@example.com");
    expect(cancelled.cancelledAt).not.toBeNull();
    expect(availableStock("habanero-extreme")).toBe(6);
  });

  it("refuse une deuxième annulation", async () => {
    const order = await passerCommande();
    await cancelOrder(order.id, commandeInvite.email);
    await expect(cancelOrder(order.id, commandeInvite.email)).rejects.toMatchObject({
      code: "not_cancellable",
      message: "Cette commande est déjà annulée.",
    });
  });

  it("refuse d'annuler une commande déjà livrée", async () => {
    await login(DEMO_ACCOUNT);
    await expect(cancelOrder("CRK-DEMO3")).rejects.toMatchObject({ code: "not_cancellable" });
  });

  it("refuse l'accès sans le bon e-mail ni le bon compte", async () => {
    const order = await passerCommande();
    await expect(cancelOrder(order.id, "autre@example.com")).rejects.toMatchObject({ code: "not_found" });
    await login(DEMO_ACCOUNT);
    await expect(cancelOrder(order.id)).rejects.toMatchObject({ code: "not_found" });
  });
});

describe("commandes invité", () => {
  it("sont rattachées au compte créé avec le même e-mail", async () => {
    const order = await passerCommande();
    await register({ email: "Camille@Example.com", password: "croustille1", firstName: "Camille", lastName: "Durand" });
    expect((await listMyOrders()).map((o) => o.id)).toEqual([order.id]);
  });

  it("sont rattachées à la connexion si le compte existait déjà", async () => {
    await register({ email: "camille@example.com", password: "croustille1", firstName: "Camille", lastName: "Durand" });
    await logout();
    const order = await passerCommande();
    await login({ email: "camille@example.com", password: "croustille1" });
    expect((await listMyOrders()).map((o) => o.id)).toEqual([order.id]);
  });
});
