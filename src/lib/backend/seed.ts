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
  addresses: [
    {
      id: "adr_demo_maison",
      label: "Maison",
      firstName: "Alex",
      lastName: "Martin",
      line1: "12 rue des Patates",
      zip: "75011",
      city: "Paris",
      phone: "06 12 34 56 78",
      isDefault: true,
    },
    {
      id: "adr_demo_bureau",
      label: "Bureau",
      firstName: "Alex",
      lastName: "Martin",
      line1: "48 avenue du Croustillant",
      line2: "3e étage",
      zip: "69002",
      city: "Lyon",
      isDefault: false,
    },
  ],
  favorites: ["truffe-noire", "paprika-fume", "habanero-extreme"],
};

export function seedDb(version: number): Db {
  return {
    version,
    users: [structuredClone(demoUser)],
    sessions: [],
    resetTokens: [],
    guestFavorites: [],
    orders: [],
    pendingCheckouts: [],
    sold: {},
  };
}
