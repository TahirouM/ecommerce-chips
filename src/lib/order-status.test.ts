import { describe, expect, it } from "vitest";
import { isCancellable, orderStatus, stepDate } from "./order-status";

const at = (minutes: number) => new Date(Date.parse("2026-10-08T10:00:00Z") + minutes * 60_000);
const order = { createdAt: "2026-10-08T10:00:00Z", cancelledAt: null };

describe("orderStatus", () => {
  it.each([
    [0, "confirmee"],
    [1.9, "confirmee"],
    [2, "preparation"],
    [5, "expediee"],
    [9.9, "expediee"],
    [10, "livree"],
    [60 * 24 * 30, "livree"],
  ])("à +%s min : %s", (minutes, status) => {
    expect(orderStatus(order, at(minutes))).toBe(status);
  });

  it("une commande annulée reste annulée", () => {
    expect(orderStatus({ ...order, cancelledAt: "2026-10-08T10:01:00Z" }, at(30))).toBe("annulee");
  });
});

describe("isCancellable", () => {
  it("autorise l'annulation tant que le colis n'est pas expédié", () => {
    expect(isCancellable(order, at(1))).toBe(true);
    expect(isCancellable(order, at(4))).toBe(true);
    expect(isCancellable(order, at(5))).toBe(false);
    expect(isCancellable({ ...order, cancelledAt: "2026-10-08T10:01:00Z" }, at(1))).toBe(false);
  });
});

describe("stepDate", () => {
  it("date chaque étape à partir de la commande", () => {
    expect(stepDate(order, 5).toISOString()).toBe("2026-10-08T10:05:00.000Z");
  });
});
