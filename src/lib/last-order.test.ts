import { describe, expect, it } from "vitest";
import { loadLastOrder, saveLastOrder } from "./last-order";

describe("dernière commande", () => {
  it("relit la référence enregistrée", () => {
    saveLastOrder({ id: "CRK-TEST", email: "a@b.fr" });
    expect(loadLastOrder()).toEqual({ id: "CRK-TEST", email: "a@b.fr" });
  });

  it.each(["{oups", '{"id":1}', "null"])("renvoie null pour une valeur invalide (%s)", (raw) => {
    sessionStorage.setItem("craak-last-order", raw);
    expect(loadLastOrder()).toBeNull();
  });
});
