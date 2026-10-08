import type { Page } from "@playwright/test";

/**
 * Les composants interactifs ne réagissent qu'une fois React hydraté : sans cette attente,
 * un clic ou une saisie trop rapide est perdu et le test devient instable.
 */
export async function ouvrir(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

// Intl sépare les euros par une espace insécable : on accepte tout type d'espace.
export const euros = (amount: string) => new RegExp(amount.replace(" ", "\\s"));
