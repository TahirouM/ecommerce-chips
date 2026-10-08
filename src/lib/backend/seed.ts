import type { Db, UserRecord } from "./types";

/** Compte de démonstration, affiché sur la page de connexion. */
export const DEMO_ACCOUNT = { email: "demo@craak.fr", password: "chips2026" } as const;

// Hash PBKDF2 précalculé de DEMO_ACCOUNT.password (le seed doit rester synchrone).
const demoUser: UserRecord = {
  id: "usr_demo",
  email: DEMO_ACCOUNT.email,
  firstName: "Alex",
  lastName: "Martin",
  salt: "c7a1f0d2e9b84a3f6d5e2c1b0a9f8e7d",
  passwordHash: "7d0bba59a723f566c4bd5d33f53d850b47fd786b0b096680beddca65e66289f6",
  createdAt: "2026-09-01T10:00:00.000Z",
  addresses: [],
  favorites: [],
};

export function seedDb(version: number): Db {
  return {
    version,
    users: [structuredClone(demoUser)],
    sessions: [],
    resetTokens: [],
  };
}
