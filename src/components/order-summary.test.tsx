import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { cart, setPromoCode } from "@/lib/cart";
import { OrderSummary } from "./order-summary";

const plain = (s: string | null) => s?.replace(/\s/g, " ");
const total = () => plain(screen.getByText("Total TTC").nextElementSibling!.textContent);
const livraison = () => plain(screen.getByText("Livraison").nextElementSibling!.textContent);

describe("OrderSummary", () => {
  beforeEach(() => {
    cart.clear();
    setPromoCode(null);
  });

  it("indique que la livraison est calculée plus tard sur la page panier", () => {
    cart.add("sel-de-mer", 2); // 4,98 €
    render(<OrderSummary />);
    expect(livraison()).toBe("Calculée à l'étape suivante");
    expect(total()).toBe("4,98 €");
  });

  it("ajoute les frais de port choisis au total", () => {
    cart.add("sel-de-mer", 2);
    render(<OrderSummary shippingId="standard" />);
    expect(total()).toBe("9,88 €");
  });

  it("affiche la livraison offerte au-delà du seuil", () => {
    cart.add("box-decouverte", 3); // 41,70 €
    render(<OrderSummary shippingId="standard" />);
    expect(livraison()).toBe("Offerte 🎉");
    expect(total()).toBe("41,70 €");
  });

  // Régression : l'express (8,90 €) était masqué dès que la livraison standard devenait
  // offerte, alors que le bouton « Valider » et la commande enregistrée l'incluaient.
  it("facture l'express même quand la livraison standard est offerte", () => {
    cart.add("box-decouverte", 3);
    render(<OrderSummary shippingId="express" />);
    expect(livraison()).toBe("8,90 €");
    expect(total()).toBe("50,60 €");
  });

  it("déduit la remise d'un code promo valide", () => {
    cart.add("sel-de-mer", 4); // 9,96 €
    setPromoCode("BIENVENUE10");
    render(<OrderSummary shippingId="standard" />);
    expect(plain(screen.getByText("Remise (BIENVENUE10)").nextElementSibling!.textContent)).toBe("−1,00 €");
    expect(total()).toBe("13,86 €"); // 9,96 − 1,00 + 4,90
  });

  it("ignore un code qui ne s'applique pas au panier", () => {
    cart.add("sel-de-mer", 1); // 2,49 € : sous le minimum de CRAAK5
    setPromoCode("CRAAK5");
    render(<OrderSummary shippingId="standard" />);
    expect(screen.queryByText(/Remise/)).toBeNull();
    expect(total()).toBe("7,39 €");
  });
});
