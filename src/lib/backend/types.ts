/** Modèle de données du backend simulé. Les montants sont en centimes (ADR 0002). */

export type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  zip: string;
  city: string;
  phone?: string;
  isDefault: boolean;
};

export type UserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  addresses: Address[];
  favorites: string[];
};

/** Ce que le « serveur » renvoie au client : jamais le hash ni le sel. */
export type PublicUser = Omit<UserRecord, "salt" | "passwordHash">;

export type Session = { token: string; userId: string; createdAt: string };

export type ResetToken = { token: string; userId: string; expiresAt: string; used: boolean };

export type Db = {
  version: number;
  users: UserRecord[];
  sessions: Session[];
  resetTokens: ResetToken[];
  /** Favoris d'un visiteur non connecté, fusionnés dans son compte à la connexion. */
  guestFavorites: string[];
};
