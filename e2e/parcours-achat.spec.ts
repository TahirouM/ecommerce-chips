import { expect, test, type Page } from "@playwright/test";

// Intl sépare les euros par une espace insécable : on accepte tout type d'espace.
const euros = (amount: string) => new RegExp(amount.replace(" ", "\\s"));

/**
 * Les composants interactifs ne réagissent qu'une fois React hydraté : sans cette attente,
 * un clic ou une saisie trop rapide est perdu et le test devient instable.
 */
async function ouvrir(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

async function remplirCoordonnees(page: Page) {
  await page.getByPlaceholder("Adresse e-mail").fill("camille@example.com");
  await page.getByPlaceholder("Prénom").fill("Camille");
  await page.getByPlaceholder("Nom", { exact: true }).fill("Martin");
  await page.getByPlaceholder("Adresse", { exact: true }).fill("1 rue des Lilas");
  await page.getByPlaceholder("Code postal").fill("75011");
  await page.getByPlaceholder("Ville").fill("Paris");
}

test("parcours d'achat complet : fiche produit → panier → commande → confirmation", async ({ page }) => {
  await ouvrir(page, "/produits/sel-de-mer");
  await expect(page.getByRole("heading", { level: 1, name: "Sel de mer" })).toBeVisible();

  await page.getByRole("button", { name: "Augmenter" }).click();
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await expect(page.getByRole("status")).toContainText("dans le panier (2)");

  await page.getByRole("link", { name: "Voir le panier →" }).click();
  await expect(page).toHaveURL("/panier");
  await expect(page.getByRole("link", { name: "Sel de mer", exact: true })).toBeVisible();
  await expect(page.getByText("Total TTC").locator("+ dd")).toHaveText(euros("4,98 €"));

  await page.getByRole("link", { name: /Passer commande/ }).click();
  await expect(page).toHaveURL("/commande");
  await remplirCoordonnees(page);
  // 4,98 € + 4,90 € de livraison standard
  await page.getByRole("button", { name: euros("Valider la commande · 9,88 €") }).click();

  await expect(page).toHaveURL("/commande/confirmation");
  await expect(page.getByRole("heading", { name: "Commande confirmée !" })).toBeVisible();
  await expect(page.getByText(/CRK-[0-9A-Z]+/)).toBeVisible();
  await expect(page.getByText("Livraison à : 1 rue des Lilas, 75011 Paris")).toBeVisible();

  // Le panier est vidé après la commande.
  await ouvrir(page, "/panier");
  await expect(page.getByText("Votre panier est vide")).toBeVisible();
});

test("la livraison standard est offerte dès 35 €, l'express reste facturée", async ({ page }) => {
  await ouvrir(page, "/produits/box-decouverte");
  await page.getByRole("button", { name: "Augmenter" }).click();
  await page.getByRole("button", { name: "Augmenter" }).click();
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();

  await ouvrir(page, "/commande");
  const recap = page.getByRole("complementary");
  await expect(recap.getByText("Offerte 🎉")).toBeVisible();
  await expect(recap.getByText("Total TTC").locator("+ dd")).toHaveText(euros("41,70 €"));

  await page.getByLabel(/Livraison express/).check();
  await expect(recap.getByText("Total TTC").locator("+ dd")).toHaveText(euros("50,60 €"));
  await expect(page.getByRole("button", { name: euros("Valider la commande · 50,60 €") })).toBeVisible();
});

test("le panier survit à un rechargement de la page", async ({ page }) => {
  await ouvrir(page, "/produits/paprika-fume");
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await page.reload();
  await ouvrir(page, "/panier");
  await expect(page.getByRole("link", { name: "Paprika fumé", exact: true })).toBeVisible();
});

test("un produit épuisé ne peut pas être ajouté", async ({ page }) => {
  await ouvrir(page, "/produits/poulet-roti");
  await expect(page.getByRole("button", { name: "Indisponible pour le moment" })).toBeDisabled();
  await expect(page.getByText("Victime de son succès — bientôt de retour")).toBeVisible();
});

test("la recherche du catalogue filtre les saveurs", async ({ page }) => {
  await ouvrir(page, "/produits");
  // La recherche porte sur le nom et la description.
  await page.getByRole("searchbox", { name: "Rechercher" }).fill("habanero");
  await expect(page.getByText("1 saveur", { exact: true })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Habanero extrême");

  await page.getByRole("searchbox", { name: "Rechercher" }).fill("introuvable");
  await expect(page.getByText("Aucune chips ne correspond")).toBeVisible();
});
