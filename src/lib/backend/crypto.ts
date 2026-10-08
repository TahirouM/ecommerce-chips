/**
 * Hachage des mots de passe (PBKDF2-SHA-256, sel aléatoire). Même simulé, un backend ne
 * stocke jamais un mot de passe en clair : on garde les bonnes pratiques pour la vraie API.
 */

const ITERATIONS = 100_000;

const toHex = (bytes: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");

export function randomToken(bytes = 16) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

export function randomId(prefix: string) {
  return `${prefix}_${randomToken(8)}`;
}

export async function hashPassword(password: string, salt = randomToken()) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: ITERATIONS },
    key,
    256,
  );
  return { salt, hash: toHex(bits) };
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  return (await hashPassword(password, salt)).hash === hash;
}
