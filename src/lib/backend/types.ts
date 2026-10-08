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

export type ShippingAddress = Omit<Address, "id" | "isDefault" | "label">;

export type OrderLine = { slug: string; name: string; unitPrice: number; quantity: number; total: number };

export type OrderPayment = { brand: string; last4: string; threeDSecure: boolean };

export type Order = {
  id: string;
  userId: string | null;
  email: string;
  createdAt: string;
  address: ShippingAddress;
  shippingId: "standard" | "express";
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
  payment: OrderPayment;
  trackingNumber: string;
  cancelledAt: string | null;
};

/** Commande en attente de validation 3-D Secure : rien n'est débité ni réservé avant. */
export type PendingCheckout = {
  id: string;
  order: Omit<Order, "createdAt" | "trackingNumber" | "cancelledAt">;
  saveAddress: boolean;
  expiresAt: string;
};

export type Db = {
  version: number;
  users: UserRecord[];
  sessions: Session[];
  resetTokens: ResetToken[];
  /** Favoris d'un visiteur non connecté, fusionnés dans son compte à la connexion. */
  guestFavorites: string[];
  orders: Order[];
  pendingCheckouts: PendingCheckout[];
  /** Quantités vendues par produit : stock disponible = stock du catalogue − vendu. */
  sold: Record<string, number>;
};
