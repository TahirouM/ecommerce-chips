import { expect, test, type Page } from "@playwright/test";
import { euros, ouvrir } from "./helpers";

const total = (page: Page) => page.getByRole("complementary").getByText("Total TTC").locator("+ dd");

async function ajouter(page: Page, slug: string, quantite = 1) {
  await ouvrir(page, `/produits/${slug}`);
  for (let i = 1; i < quantite; i++) await page.getByRole("button", { name: "Augmenter" }).click();
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await expect(page.getByRole("status")).toContainText("dans le panier");
}

async function continuerEnInvite(page: Page) {
  await ouvrir(page, "/commande");
  await page.getByLabel("Adresse e-mail").fill("camille@example.com");
  await page.getByRole("button", { name: "Continuer en invité" }).click();
}

async function remplirLivraison(page: Page, mode: "standard" | "express" = "standard") {
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel("Nom", { exact: true }).fill("Durand");
  await page.getByLabel("Adresse", { exact: true }).fill("3 place des Frites");
  await page.getByLabel("Code postal").fill("13001");
  await page.getByLabel("Ville").fill("Marseille");
  if (mode === "express") await page.getByLabel(/Livraison express/).check();
  await page.getByRole("button", { name: "Continuer vers le paiement →" }).click();
}

async function payerAvec(page: Page, carte: RegExp) {
  await page.getByRole("button", { name: carte }).click();
  await page.getByRole("button", { name: /^🔒 Payer/ }).click();
}

test("achat invité complet avec code promo : panier → livraison → paiement → confirmation", async ({ page }) => {
  await ajouter(page, "habanero-extreme", 2); // 2 × 3,49 € = 6,98 €
  await ouvrir(page, "/panier");
  await page.getByLabel("Code promo").fill("bienvenue10");
  await page.getByRole("button", { name: "Appliquer" }).click();
  await expect(page.getByText("BIENVENUE10", { exact: true })).toBeVisible();
  await expect(total(page)).toHaveText(euros("6,28 €")); // −0,70 €

  await page.getByRole("link", { name: /Passer commande/ }).click();
  await continuerEnInvite(page);
  await remplirLivraison(page);
  await expect(total(page)).toHaveText(euros("11,18 €")); // + 4,90 € de livraison
  await payerAvec(page, /Paiement accepté/);

  await expect(page).toHaveURL("/commande/confirmation");
  await expect(page.getByRole("heading", { name: "Commande confirmée !" })).toBeVisible();
  await expect(page.getByText(/CRK-[0-9A-Z]+/)).toBeVisible();
  await expect(page.getByText("Remise (BIENVENUE10)")).toBeVisible();
  await expect(page.getByText(/VISA •••• 4242/)).toBeVisible();

  // Le panier est vidé et le stock a baissé.
  await expect(page.getByRole("link", { name: /Panier.*0 article/ })).toBeVisible();
  await ouvrir(page, "/produits/habanero-extreme");
  await expect(page.getByText("Plus que 4 en stock")).toBeVisible();
});

test("une carte refusée affiche une erreur et laisse le panier intact", async ({ page }) => {
  await ajouter(page, "sel-de-mer");
  await continuerEnInvite(page);
  await remplirLivraison(page);
  await payerAvec(page, /Carte refusée/);
  await expect(page.getByRole("alert").filter({ hasText: "Votre banque a refusé le paiement" })).toBeVisible();
  await expect(page).toHaveURL("/commande");

  await payerAvec(page, /Fonds insuffisants/);
  await expect(page.getByRole("alert").filter({ hasText: "fonds insuffisants" })).toBeVisible();

  await payerAvec(page, /Paiement accepté/);
  await expect(page.getByRole("heading", { name: "Commande confirmée !" })).toBeVisible();
});

test("3-D Secure : mauvais code, annulation, puis validation", async ({ page }) => {
  await ajouter(page, "paprika-fume");
  await continuerEnInvite(page);
  await remplirLivraison(page);

  await payerAvec(page, /Authentification 3-D Secure/);
  const banque = page.getByRole("dialog", { name: "Confirmez votre paiement" });
  await banque.getByLabel("Code de vérification").fill("000000");
  await banque.getByRole("button", { name: "Valider" }).click();
  await expect(banque.getByRole("alert")).toContainText("Code incorrect");

  await banque.getByRole("button", { name: "Annuler le paiement" }).click();
  await expect(banque).toBeHidden();
  await expect(page.getByRole("alert").filter({ hasText: "Paiement annulé" })).toBeVisible();

  await page.getByRole("button", { name: /^🔒 Payer/ }).click();
  await banque.getByLabel("Code de vérification").fill("123456");
  await banque.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByRole("heading", { name: "Commande confirmée !" })).toBeVisible();
  await expect(page.getByText("authentifié 3-D Secure")).toBeVisible();
});

test("client connecté : adresse du carnet et livraison express facturée même au-delà de 35 €", async ({ page }) => {
  await ajouter(page, "box-decouverte", 3); // 41,70 €
  await ouvrir(page, "/connexion?retour=%2Fcommande");
  await page.getByRole("button", { name: "Remplir avec le compte démo" }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL("/commande");
  await expect(page.getByText("Connecté en tant que")).toBeVisible();

  await page.getByLabel(/Bureau/).check();
  await expect(page.getByLabel(/Livraison standard/)).toBeChecked();
  await expect(page.getByLabel(/Livraison standard/).locator("..")).toContainText("Offerte");
  await page.getByLabel(/Livraison express/).check();
  await page.getByRole("button", { name: "Continuer vers le paiement →" }).click();
  await expect(total(page)).toHaveText(euros("50,60 €"));
  await payerAvec(page, /Paiement accepté/);

  await expect(page.getByRole("heading", { name: "Commande confirmée !" })).toBeVisible();
  await expect(page.getByText("Livraison à", { exact: true }).locator("..")).toContainText("69002 Lyon");
  await expect(page.getByText("Total payé").locator("+ span")).toHaveText(euros("50,60 €"));
});

test("le panier survit à un rechargement de la page", async ({ page }) => {
  await ajouter(page, "paprika-fume");
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
