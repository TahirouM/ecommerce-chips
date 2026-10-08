import { getProduct } from "../products";
import { readDb } from "./store";
import type { Db } from "./types";

/** Stock réellement disponible : stock du catalogue moins les quantités déjà vendues. */
export function availableStock(slug: string, db: Db = readDb()) {
  const stock = getProduct(slug)?.stock ?? 0;
  return Math.max(0, stock - (db.sold[slug] ?? 0));
}
