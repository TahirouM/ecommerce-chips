import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { cart } from "@/lib/cart";
import { OrderSummary } from "./order-summary";

const plain = (s: string | null) => s?.replace(/\s/g, " ");
const total = () => plain(screen.getByText("Total TTC").nextElementSibling!.textContent);
const livraison = () => plain(screen.getByText("Livraison").nextElementSibling!.textContent);

describe("OrderSummary", () => {
  beforeEach(() => cart.clear());

  it("indique que la livraison est calculée plus tard sur la page panier", () => {
    cart.add("sel-de-mer", 2); // 4,98 €
    render(<OrderSummary />);
    expect(livraison()).toBe("Calculée à l'étape suivante");
    expect(total()).toBe("4,98 €");
  });

  it("ajoute les frais de port choisis au total", () => {
    cart.add("sel-de-mer", 2);
    render(<OrderSummary shipping={490} />);
    expect(total()).toBe("9,88 €");
  });

  it("affiche la livraison offerte au-delà du seuil", () => {
    cart.add("box-decouverte", 3); // 41,70 €
    render(<OrderSummary shipping={0} />);
    expect(livraison()).toBe("Offerte 🎉");
    expect(total()).toBe("41,70 €");
  });

  // Régression : l'express (8,90 €) était masqué dès que la livraison standard devenait
  // offerte, alors que le bouton « Valider » et la commande enregistrée l'incluaient.
  it("facture l'express même quand la livraison standard est offerte", () => {
    cart.add("box-decouverte", 3);
    render(<OrderSummary shipping={890} />);
    expect(livraison()).toBe("8,90 €");
    expect(total()).toBe("50,60 €");
  });
});
