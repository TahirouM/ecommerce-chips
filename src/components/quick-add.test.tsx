import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { cart, useCart } from "@/lib/cart";
import { QuickAdd } from "./quick-add";

function Count() {
  return <output aria-label="articles">{useCart().count}</output>;
}

describe("QuickAdd", () => {
  beforeEach(() => cart.clear());

  it("ajoute un sachet au panier et confirme visuellement", async () => {
    render(
      <>
        <QuickAdd slug="sel-de-mer" stock={80} name="Sel de mer" />
        <Count />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Ajouter Sel de mer au panier" }));
    expect(screen.getByLabelText("articles")).toHaveTextContent("1");
    expect(screen.getByRole("button")).toHaveTextContent("✓");
  });

  it("se désactive quand tout le stock est dans le panier", async () => {
    render(<QuickAdd slug="habanero-extreme" stock={6} name="Habanero extrême" />);
    const button = screen.getByRole("button");
    for (let i = 0; i < 6; i++) await userEvent.click(button);
    expect(button).toBeDisabled();
  });

  it("est désactivé pour un produit épuisé", () => {
    render(<QuickAdd slug="poulet-roti" stock={0} name="Poulet rôti" />);
    expect(screen.getByRole("button", { name: "Poulet rôti épuisé" })).toBeDisabled();
  });
});
