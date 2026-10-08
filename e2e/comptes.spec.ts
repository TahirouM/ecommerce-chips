import { expect, test, type Page } from "@playwright/test";
import { ouvrir } from "./helpers";

async function seConnecter(page: Page, email: string, password: string) {
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test("création de compte, déconnexion puis reconnexion", async ({ page }) => {
  await ouvrir(page, "/inscription");
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel("Nom", { exact: true }).fill("Durand");
  await page.getByLabel("Adresse e-mail").fill("camille@example.com");
  await page.getByLabel("Mot de passe").fill("court");
  await expect(page.getByText("au moins 8 caractères")).toBeVisible();
  await page.getByLabel("Mot de passe").fill("croustille1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await expect(page).toHaveURL("/compte");
  await expect(page.getByRole("heading", { name: "Bonjour Camille 👋" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mon compte (Camille)" })).toBeVisible();

  // La session survit au rechargement.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Bonjour Camille 👋" })).toBeVisible();

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Se connecter" })).toBeVisible();

  await ouvrir(page, "/connexion");
  await seConnecter(page, "camille@example.com", "mauvais123");
  // (filtre : Next.js ajoute son propre `alert` invisible pour annoncer les navigations)
  await expect(page.getByRole("alert").filter({ hasText: "E-mail ou mot de passe incorrect." })).toBeVisible();
  await page.getByLabel("Mot de passe").fill("croustille1");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Bonjour Camille 👋" })).toBeVisible();
});

test("l'espace client redirige vers la connexion puis revient", async ({ page }) => {
  await ouvrir(page, "/compte");
  await expect(page).toHaveURL("/connexion?retour=%2Fcompte");
  await page.getByRole("button", { name: "Remplir avec le compte démo" }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL("/compte");
  await expect(page.getByRole("heading", { name: "Bonjour Alex 👋" })).toBeVisible();
});

test("mot de passe oublié : e-mail simulé, nouveau mot de passe, reconnexion", async ({ page }) => {
  await ouvrir(page, "/mot-de-passe-oublie");
  await page.getByLabel("Adresse e-mail du compte").fill("demo@craak.fr");
  await page.getByRole("button", { name: "Recevoir un lien" }).click();

  const mail = page.getByRole("article", { name: "E-mail reçu (simulation)" });
  await expect(mail).toContainText("demo@craak.fr");
  await mail.getByRole("button", { name: "Réinitialiser mon mot de passe" }).click();
  await page.getByLabel("Nouveau mot de passe").fill("nouveau2026");
  await page.getByRole("button", { name: "Enregistrer le mot de passe" }).click();
  await expect(page.getByRole("status")).toContainText("mot de passe a été modifié");

  await page.getByRole("link", { name: "Se connecter" }).last().click();
  await seConnecter(page, "demo@craak.fr", "chips2026");
  await expect(page.getByRole("alert").filter({ hasText: "incorrect" })).toBeVisible();
  await page.getByLabel("Mot de passe").fill("nouveau2026");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Bonjour Alex 👋" })).toBeVisible();
});
