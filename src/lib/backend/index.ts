/**
 * Point d'entrée unique du backend simulé (ADR 0007). Les composants n'importent que d'ici :
 * remplacer la simulation par une vraie API revient à réécrire ces fonctions, pas l'interface.
 */
export { login, logout, register, requestPasswordReset, resetPassword, passwordProblem } from "./auth";
export { ApiError, errorMessage } from "./errors";
export { DEMO_ACCOUNT } from "./seed";
export { resetDb as resetDemo } from "./store";
export type { Address, PublicUser } from "./types";
