import { normalizeEmail, isValidEmail, passwordProblem, requireUser, sessionUser, toPublicUser } from "./auth";
import { hashPassword, randomId, verifyPassword } from "./crypto";
import { ApiError } from "./errors";
import { network, readDb, setSessionToken, updateDb } from "./store";
import type { Address, Db, PublicUser } from "./types";
import { getProduct } from "../products";

/* ------------------------------------------------------------------ Profil */

export async function updateProfile(input: { firstName: string; lastName: string; email: string }) {
  await network();
  const user = requireUser();
  const email = normalizeEmail(input.email);
  if (!input.firstName.trim() || !input.lastName.trim())
    throw new ApiError("invalid_input", "Indiquez votre prénom et votre nom.");
  if (!isValidEmail(email)) throw new ApiError("invalid_input", "Cette adresse e-mail n'est pas valide.");
  if (readDb().users.some((u) => u.email === email && u.id !== user.id)) {
    throw new ApiError("email_taken", "Cette adresse est déjà utilisée par un autre compte.");
  }
  return updateDb((db): PublicUser => {
    const u = db.users.find((x) => x.id === user.id)!;
    Object.assign(u, { firstName: input.firstName.trim(), lastName: input.lastName.trim(), email });
    return toPublicUser(u);
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await network();
  const user = requireUser();
  if (!(await verifyPassword(currentPassword, user.salt, user.passwordHash))) {
    throw new ApiError("invalid_credentials", "Le mot de passe actuel est incorrect.");
  }
  const problem = passwordProblem(newPassword);
  if (problem) throw new ApiError("weak_password", problem);
  const { salt, hash } = await hashPassword(newPassword);
  updateDb((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    u.salt = salt;
    u.passwordHash = hash;
  });
}

/** Suppression définitive (droit à l'effacement) : le mot de passe est redemandé. */
export async function deleteAccount(password: string) {
  await network();
  const user = requireUser();
  if (!(await verifyPassword(password, user.salt, user.passwordHash))) {
    throw new ApiError("invalid_credentials", "Mot de passe incorrect.");
  }
  updateDb((db) => {
    db.users = db.users.filter((u) => u.id !== user.id);
    db.sessions = db.sessions.filter((s) => s.userId !== user.id);
    db.resetTokens = db.resetTokens.filter((t) => t.userId !== user.id);
  });
  setSessionToken(null);
}

/* --------------------------------------------------------------- Adresses */

export type AddressInput = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

/** Vérifie une adresse de livraison française. Renvoie le premier problème, ou null. */
export function addressProblem(a: AddressInput) {
  for (const [key, label] of [
    ["firstName", "le prénom"],
    ["lastName", "le nom"],
    ["line1", "l'adresse"],
    ["city", "la ville"],
  ] as const) {
    if (!a[key]?.trim()) return `Indiquez ${label}.`;
  }
  if (!/^\d{5}$/.test(a.zip.trim())) return "Le code postal doit comporter 5 chiffres.";
  if (a.phone && !/^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(a.phone.trim()))
    return "Le numéro de téléphone n'est pas valide.";
  return null;
}

function clean(a: AddressInput) {
  return {
    label: a.label.trim() || "Adresse",
    firstName: a.firstName.trim(),
    lastName: a.lastName.trim(),
    line1: a.line1.trim(),
    line2: a.line2?.trim() || undefined,
    zip: a.zip.trim(),
    city: a.city.trim(),
    phone: a.phone?.trim() || undefined,
  };
}

function setDefault(addresses: Address[], id: string) {
  for (const a of addresses) a.isDefault = a.id === id;
}

export async function saveAddress(input: AddressInput & { id?: string }): Promise<Address> {
  await network();
  const user = requireUser();
  const problem = addressProblem(input);
  if (problem) throw new ApiError("invalid_input", problem);

  return updateDb((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    let address = input.id ? u.addresses.find((a) => a.id === input.id) : undefined;
    if (input.id && !address) throw new ApiError("not_found", "Adresse introuvable.");
    if (address) Object.assign(address, clean(input));
    else {
      address = { id: randomId("adr"), ...clean(input), isDefault: false };
      u.addresses.push(address);
    }
    // La première adresse devient l'adresse par défaut.
    if (input.isDefault || u.addresses.length === 1) setDefault(u.addresses, address.id);
    return structuredClone(address);
  });
}

export async function deleteAddress(id: string) {
  await network();
  const user = requireUser();
  updateDb((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    const removed = u.addresses.find((a) => a.id === id);
    u.addresses = u.addresses.filter((a) => a.id !== id);
    // On ne laisse jamais un carnet sans adresse par défaut.
    if (removed?.isDefault && u.addresses[0]) u.addresses[0].isDefault = true;
  });
}

export async function setDefaultAddress(id: string) {
  await network();
  const user = requireUser();
  updateDb((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    if (!u.addresses.some((a) => a.id === id)) throw new ApiError("not_found", "Adresse introuvable.");
    setDefault(u.addresses, id);
  });
}

/* ---------------------------------------------------------------- Favoris */

/** Favoris courants : ceux du compte connecté, sinon ceux du visiteur. Lecture synchrone. */
export function currentFavorites(db: Db = readDb()) {
  return sessionUser(db)?.favorites ?? db.guestFavorites;
}

/** Bascule un favori ; immédiat (pas de latence) pour que le cœur réagisse au clic. */
export function toggleFavorite(slug: string) {
  if (!getProduct(slug)) throw new ApiError("not_found", "Produit introuvable.");
  updateDb((db) => {
    const user = sessionUser(db);
    const list = user ? user.favorites : db.guestFavorites;
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    if (user) user.favorites = next;
    else db.guestFavorites = next;
  });
}
