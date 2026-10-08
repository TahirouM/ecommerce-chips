import { describe, expect, it } from "vitest";
import {
  cardBrand,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  paymentOutcome,
  TEST_CARDS,
  validateCard,
  type CardInput,
} from "./card";

const now = new Date("2026-10-08T12:00:00Z");
const valid: CardInput = { name: "Alex Martin", number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123" };

describe("luhnValid", () => {
  it.each(TEST_CARDS.map((c) => c.number))("accepte la carte de test %s", (number) => {
    expect(luhnValid(number)).toBe(true);
  });

  it("détecte une faute de frappe", () => {
    expect(luhnValid("4242 4242 4242 4241")).toBe(false);
  });

  it("refuse un numéro trop court", () => {
    expect(luhnValid("4242")).toBe(false);
  });
});

describe("cardBrand", () => {
  it.each([
    ["4242424242424242", "visa"],
    ["5555555555554444", "mastercard"],
    ["2223003122003222", "mastercard"],
    ["378282246310005", "amex"],
    ["6011111111111117", "carte"],
  ])("%s → %s", (number, brand) => {
    expect(cardBrand(number)).toBe(brand);
  });
});

describe("formatage de la saisie", () => {
  it("groupe le numéro par 4", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("42a42 42")).toBe("4242 42");
  });

  it("insère la barre de la date d'expiration", () => {
    expect(formatExpiry("1228")).toBe("12/28");
    expect(formatExpiry("1")).toBe("1");
  });
});

describe("validateCard", () => {
  it("accepte une carte valide", () => {
    expect(validateCard(valid, now)).toEqual({});
  });

  it("signale chaque champ invalide", () => {
    expect(validateCard({ name: " ", number: "1234", expiry: "13/30", cvc: "12" }, now)).toEqual({
      name: "Indiquez le nom inscrit sur la carte.",
      number: "Ce numéro de carte n'est pas valide.",
      expiry: "Format attendu : MM/AA.",
      cvc: "Le cryptogramme comporte 3 chiffres.",
    });
  });

  it("accepte une carte jusqu'à la fin de son mois d'expiration", () => {
    expect(validateCard({ ...valid, expiry: "10/26" }, now).expiry).toBeUndefined();
    expect(validateCard({ ...valid, expiry: "09/26" }, now).expiry).toBe("Cette carte a expiré.");
  });

  it("exige 4 chiffres de cryptogramme pour une American Express", () => {
    expect(validateCard({ ...valid, number: "378282246310005", cvc: "123" }, now).cvc).toBe(
      "Le cryptogramme comporte 4 chiffres.",
    );
  });
});

describe("paymentOutcome", () => {
  it("choisit l'issue selon la carte de test", () => {
    expect(paymentOutcome("4000002760003184")).toBe("requires_action");
    expect(paymentOutcome("4000 0000 0000 0002")).toBe("declined");
    expect(paymentOutcome("4000 0000 0000 9995")).toBe("insufficient_funds");
  });

  it("accepte toute autre carte valide", () => {
    expect(paymentOutcome("5555 5555 5555 4444")).toBe("succeeded");
  });
});
