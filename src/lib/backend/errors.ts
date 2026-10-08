export type ApiErrorCode =
  | "invalid_input"
  | "invalid_credentials"
  | "email_taken"
  | "weak_password"
  | "unauthorized"
  | "not_found"
  | "invalid_token"
  | "out_of_stock"
  | "payment_failed"
  | "invalid_promo"
  | "not_cancellable";

/** Erreur métier renvoyée par le backend : `code` pour la logique, `message` pour l'utilisateur. */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Une erreur inattendue est survenue. Réessayez.";
}
