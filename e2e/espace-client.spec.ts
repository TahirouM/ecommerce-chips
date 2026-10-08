import { expect, test, type Page } from "@playwright/test";
import { ouvrir } from "./helpers";

async function connexionDemo(page: Page, retour = "/compte") {
  await ouvrir(page, `/connexion?retour=${encodeURIComponent(retour)}`);
  await page.getByRole("button", { name: "Remplir avec le compte démo" }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(retour);
}

test("carnet d'adresses : ajout, adresse par défaut, modification, suppression", async ({ page }) => {
  await connexionDemo(page, "/compte/adresses");
  await expect(page.getByRole("heading", { name: "Mes adresses" })).toBeVisible();
  await expect(page.getByText("Par défaut", { exact: true })).toHaveCount(1);

  await page.getByRole("button", { name: "Ajouter une adresse" }).click();
  await page.getByLabel("Nom de l'adresse").fill("Chalet");
  await page.getByLabel("Adresse", { exact: true }).fill("1 route des Cimes");
  await page.getByLabel("Code postal").fill("7400");
  await page.getByLabel("Ville").fill("Chamonix");
  await page.getByLabel("Utiliser comme adresse par défaut").check();
  await page.getByRole("button", { name: "Ajouter l'adresse" }).click();
  // Le navigateur bloque d'abord le code postal invalide (pattern), puis on corrige.
  await page.getByLabel("Code postal").fill("74400");
  await page.getByRole("button", { name: "Ajouter l'adresse" }).click();

  const chalet = page.getByRole("listitem").filter({ hasText: "Chalet" });
  await expect(chalet).toContainText("74400 Chamonix");
  await expect(chalet.getByText("Par défaut", { exact: true })).toBeVisible();
  await expect(page.getByText("Par défaut", { exact: true })).toHaveCount(1);

  await chalet.getByRole("button", { name: "Modifier" }).click();
  await page.getByLabel("Ville").fill("Chamonix-Mont-Blanc");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(chalet).toContainText("74400 Chamonix-Mont-Blanc");

  page.once("dialog", (d) => d.accept());
  await chalet.getByRole("button", { name: "Supprimer l'adresse Chalet" }).click();
  await expect(chalet).toHaveCount(0);
  // Une autre adresse redevient l'adresse par défaut.
  await expect(page.getByText("Par défaut", { exact: true })).toHaveCount(1);
});

test("profil : modification des informations et du mot de passe", async ({ page }) => {
  await connexionDemo(page, "/compte/profil");
  await page.getByLabel("Prénom").fill("Alexis");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Vos informations sont à jour." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mon compte (Alexis)" })).toBeVisible();

  await page.getByLabel("Mot de passe actuel").fill("mauvais123");
  await page.getByLabel("Nouveau mot de passe").fill("nouveau2026");
  await page.getByRole("button", { name: "Changer le mot de passe" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Le mot de passe actuel est incorrect." })).toBeVisible();

  await page.getByLabel("Mot de passe actuel").fill("chips2026");
  await page.getByRole("button", { name: "Changer le mot de passe" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Mot de passe modifié." })).toBeVisible();
});

test("favoris : ajoutés en visiteur, puis rattachés au compte à la connexion", async ({ page }) => {
  await ouvrir(page, "/produits/sel-de-mer");
  await page.getByRole("button", { name: "Ajouter Sel de mer aux favoris" }).click();
  await expect(page.getByRole("button", { name: "Retirer Sel de mer des favoris" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("link", { name: "Mes favoris (1)" })).toBeVisible();

  await ouvrir(page, "/favoris");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByText("gardés sur cet appareil")).toBeVisible();

  // Le compte démo a déjà 3 favoris : on en obtient 4 après connexion.
  await page.getByRole("link", { name: "Connectez-vous" }).click();
  await page.getByRole("button", { name: "Remplir avec le compte démo" }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL("/favoris");
  await expect(page.getByRole("article")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Mes favoris (4)" })).toBeVisible();
});

test("suppression du compte", async ({ page }) => {
  await ouvrir(page, "/inscription");
  await page.getByLabel("Prénom").fill("Sam");
  await page.getByLabel("Nom", { exact: true }).fill("Leroy");
  await page.getByLabel("Adresse e-mail").fill("sam@example.com");
  await page.getByLabel("Mot de passe").fill("croustille1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL("/compte");

  await ouvrir(page, "/compte/profil");
  await page.getByRole("button", { name: "Supprimer mon compte" }).click();
  await page.getByLabel("Confirmez avec votre mot de passe").fill("croustille1");
  await page.getByRole("button", { name: "Supprimer définitivement" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Se connecter" })).toBeVisible();

  await ouvrir(page, "/connexion");
  await page.getByLabel("Adresse e-mail").fill("sam@example.com");
  await page.getByLabel("Mot de passe").fill("croustille1");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "incorrect" })).toBeVisible();
});
