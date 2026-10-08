/**
 * Page où revenir après connexion (`?retour=/commande`). Seuls les chemins internes sont
 * acceptés, pour empêcher une redirection ouverte vers un site tiers (`//evil.com`).
 */
export function safeReturnTo(value: string | null | undefined, fallback = "/compte") {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : fallback;
}

export function loginUrl(returnTo: string) {
  return `/connexion?retour=${encodeURIComponent(returnTo)}`;
}
