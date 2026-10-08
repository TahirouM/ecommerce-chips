import { describe, expect, it } from "vitest";
import { loginUrl, safeReturnTo } from "./return-to";

describe("safeReturnTo", () => {
  it("accepte un chemin interne", () => {
    expect(safeReturnTo("/commande")).toBe("/commande");
  });

  it.each([null, "", "https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"])(
    "refuse %j (redirection ouverte) et renvoie la valeur par défaut",
    (value) => {
      expect(safeReturnTo(value)).toBe("/compte");
    },
  );
});

describe("loginUrl", () => {
  it("encode la page de retour", () => {
    expect(loginUrl("/commande?etape=2")).toBe("/connexion?retour=%2Fcommande%3Fetape%3D2");
  });
});
