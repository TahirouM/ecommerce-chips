/**
 * Point d'entrée unique du backend simulé (ADR 0007). Les composants n'importent que d'ici :
 * remplacer la simulation par une vraie API revient à réécrire ces fonctions, pas l'interface.
 */
export { isValidEmail, login, logout, passwordProblem, register, requestPasswordReset, resetPassword } from "./auth";
export {
  addressProblem,
  changePassword,
  deleteAccount,
  deleteAddress,
  saveAddress,
  setDefaultAddress,
  toggleFavorite,
  updateProfile,
  type AddressInput,
} from "./account";
export {
  cancelThreeDSecure,
  confirmThreeDSecure,
  getOrder,
  placeOrder,
  type CheckoutInput,
  type CheckoutResult,
} from "./checkout";
export { ApiError, errorMessage } from "./errors";
export { availableStock } from "./inventory";
export { DEMO_ACCOUNT } from "./seed";
export { resetDb as resetDemo } from "./store";
export type { Address, Order, OrderLine, PublicUser, ShippingAddress } from "./types";
