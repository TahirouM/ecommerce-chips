import { beforeEach, describe, expect, it } from "vitest";
import { login, register, sessionUser } from "./auth";
import { cancelThreeDSecure, confirmThreeDSecure, getOrder, placeOrder, type CheckoutInput } from "./checkout";
import { availableStock } from "./inventory";
import { DEMO_ACCOUNT } from "./seed";
import { readDb, resetDb } from "./store";

const CARDS = {
  ok: "4242 4242 4242 4242",
  threeDS: "4000 0027 6000 3184",
  declined: "4000 0000 0000 0002",
  noFunds: "4000 0000 0000 9995",
};

const adresse = {
  firstName: "Camille",
  lastName: "Durand",
  line1: "3 place des Frites",
  zip: "13001",
  city: "Marseille",
};

const commande = (overrides: Partial<CheckoutInput> = {}): CheckoutInput => ({
  items: [{ slug: "sel-de-mer", quantity: 2 }],
  shippingId: "standard",
  promoCode: null,
  email: "camille@example.com",
  address: adresse,
  card: { name: "Camille Durand", number: CARDS.ok, expiry: "12/30", cvc: "123" },
  ...overrides,
});

// Le compte démo a déjà des commandes : on ne regarde que celles du test.
const commandesDeCamille = () => readDb().orders.filter((o) => o.email === "camille@example.com");

beforeEach(() => resetDb());

describe("placeOrder", () => {
  it("enregistre une commande invité et décrémente le stock", async () => {
    const result = await placeOrder(commande());
    expect(result.status).toBe("succeeded");
    if (result.status !== "succeeded") return;
    expect(result.order).toMatchObject({
      userId: null,
      email: "camille@example.com",
      subtotal: 498,
      shipping: 490,
      total: 988,
      payment: { brand: "visa", last4: "4242", threeDSecure: false },
    });
    expect(result.order.id).toMatch(/^CRK-/);
    expect(availableStock("sel-de-mer")).toBe(78);
  });

  it("recalcule les prix depuis le catalogue, quoi que le client envoie", async () => {
    const items = [{ slug: "sel-de-mer", quantity: 1, price: 1 }] as unknown as CheckoutInput["items"];
    const result = await placeOrder(commande({ items }));
    expect(result.status === "succeeded" && result.order.subtotal).toBe(249);
  });

  it("applique le code promo et refuse un code invalide", async () => {
    const ok = await placeOrder(commande({ promoCode: "bienvenue10" }));
    expect(ok.status === "succeeded" && ok.order).toMatchObject({ promoCode: "BIENVENUE10", discount: 50 });
    await expect(placeOrder(commande({ promoCode: "FAUX" }))).rejects.toMatchObject({ code: "invalid_promo" });
  });

  it("refuse une quantité supérieure au stock disponible", async () => {
    await expect(placeOrder(commande({ items: [{ slug: "habanero-extreme", quantity: 7 }] }))).rejects.toMatchObject({
      code: "out_of_stock",
      message: "Il ne reste que 6 « Habanero extrême » en stock.",
    });
  });

  it("tient compte des ventes précédentes dans le stock", async () => {
    await placeOrder(commande({ items: [{ slug: "habanero-extreme", quantity: 6 }] }));
    expect(availableStock("habanero-extreme")).toBe(0);
    await expect(placeOrder(commande({ items: [{ slug: "habanero-extreme", quantity: 1 }] }))).rejects.toMatchObject({
      message: "« Habanero extrême » vient d'être épuisé. Retirez-le de votre panier.",
    });
  });

  it.each([
    [CARDS.declined, "Votre banque a refusé le paiement. Essayez une autre carte."],
    [CARDS.noFunds, "Paiement refusé : fonds insuffisants sur cette carte."],
  ])("refuse le paiement avec la carte %s sans rien enregistrer", async (number, message) => {
    await expect(
      placeOrder(commande({ card: { name: "C", number, expiry: "12/30", cvc: "123" } })),
    ).rejects.toMatchObject({ code: "payment_failed", message });
    expect(commandesDeCamille()).toHaveLength(0);
    expect(availableStock("sel-de-mer")).toBe(80);
  });

  it("refuse une carte invalide et une adresse incomplète", async () => {
    await expect(
      placeOrder(commande({ card: { name: "C", number: "1234", expiry: "12/30", cvc: "123" } })),
    ).rejects.toThrow("Ce numéro de carte n'est pas valide.");
    await expect(placeOrder(commande({ address: { ...adresse, zip: "130" } }))).rejects.toThrow(
      "Le code postal doit comporter 5 chiffres.",
    );
  });

  it("utilise l'e-mail du compte et une adresse du carnet pour un client connecté", async () => {
    await login(DEMO_ACCOUNT);
    const result = await placeOrder(commande({ email: undefined, address: { addressId: "adr_demo_bureau" } }));
    expect(result.status === "succeeded" && result.order).toMatchObject({
      userId: "usr_demo",
      email: DEMO_ACCOUNT.email,
      address: { city: "Lyon", line2: "3e étage" },
    });
  });

  it("enregistre la nouvelle adresse dans le carnet si demandé", async () => {
    await register({ email: "sam@example.com", password: "croustille1", firstName: "Sam", lastName: "Leroy" });
    await placeOrder(commande({ email: undefined, saveAddress: true }));
    expect(sessionUser()!.addresses).toEqual([expect.objectContaining({ city: "Marseille", isDefault: true })]);
  });
});

describe("3-D Secure", () => {
  const avec3DS = () =>
    placeOrder(commande({ card: { name: "C", number: CARDS.threeDS, expiry: "12/30", cvc: "123" } }));

  it("met la commande en attente sans débiter ni réserver", async () => {
    const result = await avec3DS();
    expect(result.status).toBe("requires_action");
    expect(commandesDeCamille()).toHaveLength(0);
    expect(availableStock("sel-de-mer")).toBe(80);
  });

  it("finalise avec le bon code, après un mauvais code", async () => {
    const result = await avec3DS();
    if (result.status !== "requires_action") throw new Error("3DS attendu");
    await expect(confirmThreeDSecure(result.checkoutId, "000000")).rejects.toMatchObject({ code: "payment_failed" });
    const order = await confirmThreeDSecure(result.checkoutId, "123456");
    expect(order.payment.threeDSecure).toBe(true);
    expect(availableStock("sel-de-mer")).toBe(78);
    // Le même paiement ne peut pas être validé deux fois.
    await expect(confirmThreeDSecure(result.checkoutId, "123456")).rejects.toMatchObject({ code: "invalid_token" });
  });

  it("abandonne la commande si le client annule", async () => {
    const result = await avec3DS();
    if (result.status !== "requires_action") throw new Error("3DS attendu");
    await cancelThreeDSecure(result.checkoutId);
    await expect(confirmThreeDSecure(result.checkoutId, "123456")).rejects.toMatchObject({ code: "invalid_token" });
    expect(commandesDeCamille()).toHaveLength(0);
  });
});

describe("getOrder", () => {
  it("donne accès à une commande invité avec le bon e-mail seulement", async () => {
    const result = await placeOrder(commande());
    if (result.status !== "succeeded") throw new Error();
    await expect(getOrder(result.order.id, "CAMILLE@example.com")).resolves.toMatchObject({ id: result.order.id });
    await expect(getOrder(result.order.id, "autre@example.com")).rejects.toMatchObject({ code: "not_found" });
    await expect(getOrder(result.order.id)).rejects.toMatchObject({ code: "not_found" });
  });
});
