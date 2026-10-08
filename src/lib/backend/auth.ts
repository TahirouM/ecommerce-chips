import { hashPassword, randomId, randomToken, verifyPassword } from "./crypto";
import { ApiError } from "./errors";
import { getSessionToken, network, readDb, setSessionToken, updateDb } from "./store";
import type { Db, PublicUser, UserRecord } from "./types";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Au moins 8 caractères, dont une lettre et un chiffre. Renvoie le problème, ou null. */
export function passwordProblem(password: string) {
  if (password.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
  if (!/[a-z]/i.test(password) || !/\d/.test(password))
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  return null;
}

export function toPublicUser(user: UserRecord): PublicUser {
  const { id, email, firstName, lastName, createdAt, addresses, favorites } = user;
  return { id, email, firstName, lastName, createdAt, addresses, favorites };
}

function findUserByEmail(db: Db, email: string) {
  return db.users.find((u) => u.email === normalizeEmail(email));
}

/** Utilisateur de la session courante, lu de façon synchrone (pour les hooks). */
export function sessionUser(db: Db = readDb()): UserRecord | null {
  const token = getSessionToken();
  const session = token && db.sessions.find((s) => s.token === token);
  return (session && db.users.find((u) => u.id === session.userId)) || null;
}

/** Garde des opérations qui exigent d'être connecté. */
export function requireUser(db: Db = readDb()) {
  const user = sessionUser(db);
  if (!user) throw new ApiError("unauthorized", "Votre session a expiré. Reconnectez-vous.");
  return user;
}

function openSession(userId: string) {
  const token = randomToken(24);
  updateDb((db) => {
    db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
    // Les favoris ajoutés avant connexion rejoignent ceux du compte.
    const user = db.users.find((u) => u.id === userId)!;
    user.favorites = [...new Set([...user.favorites, ...db.guestFavorites])];
    db.guestFavorites = [];
  });
  setSessionToken(token);
}

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<PublicUser> {
  await network();
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || !lastName) throw new ApiError("invalid_input", "Indiquez votre prénom et votre nom.");
  if (!isValidEmail(email)) throw new ApiError("invalid_input", "Cette adresse e-mail n'est pas valide.");
  const problem = passwordProblem(input.password);
  if (problem) throw new ApiError("weak_password", problem);
  if (findUserByEmail(readDb(), email)) {
    throw new ApiError("email_taken", "Un compte existe déjà avec cette adresse. Connectez-vous.");
  }

  const { salt, hash } = await hashPassword(input.password);
  const user: UserRecord = {
    id: randomId("usr"),
    email,
    firstName,
    lastName,
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
    addresses: [],
    favorites: [],
  };
  updateDb((db) => {
    db.users.push(user);
  });
  openSession(user.id);
  return toPublicUser(user);
}

export async function login(input: { email: string; password: string }): Promise<PublicUser> {
  await network();
  const user = findUserByEmail(readDb(), input.email);
  // Même message que l'e-mail existe ou non : on ne révèle pas quels comptes existent.
  if (!user || !(await verifyPassword(input.password, user.salt, user.passwordHash))) {
    throw new ApiError("invalid_credentials", "E-mail ou mot de passe incorrect.");
  }
  openSession(user.id);
  return toPublicUser(user);
}

export async function logout() {
  await network();
  const token = getSessionToken();
  updateDb((db) => {
    db.sessions = db.sessions.filter((s) => s.token !== token);
  });
  setSessionToken(null);
}

/**
 * Demande de réinitialisation. La réponse est identique que le compte existe ou non ;
 * `simulatedEmail` représente l'e-mail qu'aurait reçu le client (affiché en démo).
 */
export async function requestPasswordReset(email: string) {
  await network();
  const user = findUserByEmail(readDb(), email);
  if (!user) return { simulatedEmail: null };
  const token = randomToken(24);
  updateDb((db) => {
    db.resetTokens = db.resetTokens.filter((t) => t.userId !== user.id);
    db.resetTokens.push({
      token,
      userId: user.id,
      used: false,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
    });
  });
  return { simulatedEmail: { to: user.email, firstName: user.firstName, token } };
}

export async function resetPassword(token: string, password: string) {
  await network();
  const problem = passwordProblem(password);
  if (problem) throw new ApiError("weak_password", problem);
  const entry = readDb().resetTokens.find((t) => t.token === token);
  if (!entry || entry.used || new Date(entry.expiresAt).getTime() < Date.now()) {
    throw new ApiError("invalid_token", "Ce lien n'est plus valide. Refaites une demande.");
  }
  const { salt, hash } = await hashPassword(password);
  updateDb((db) => {
    db.resetTokens.find((t) => t.token === token)!.used = true;
    const user = db.users.find((u) => u.id === entry.userId)!;
    user.salt = salt;
    user.passwordHash = hash;
    // Changer de mot de passe déconnecte toutes les sessions ouvertes.
    db.sessions = db.sessions.filter((s) => s.userId !== user.id);
  });
}
