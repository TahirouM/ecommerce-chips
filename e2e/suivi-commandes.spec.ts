import { expect, test, type Page } from "@playwright/test";
import { euros, ouvrir } from "./helpers";

async function connexionDemo(page: Page, retour: string) {
  await ouvrir(page, `/connexion?retour=${encodeURIComponent(retour)}`);
  await page.getByRole("button", { name: "Remplir avec le compte démo" }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(retour);
}

/** Achat rapide d'un produit, payé avec la carte acceptée. */
async function acheter(page: Page, slug: string, quantite: number, invite?: string) {
  await ouvrir(page, `/produits/${slug}`);
  for (let i = 1; i < quantite; i++) await page.getByRole("button", { name: "Augmenter" }).click();
  await page.getByRole("button", { name: /^Ajouter au panier/ }).click();
  await ouvrir(page, "/commande");
  if (invite) {
    await page.getByLabel("Adresse e-mail").fill(invite);
    await page.getByRole("button", { name: "Continuer en invité" }).click();
    await page.getByLabel("Prénom").fill("Camille");
    await page.getByLabel("Nom", { exact: true }).fill("Durand");
    await page.getByLabel("Adresse", { exact: true }).fill("3 place des Frites");
    await page.getByLabel("Code postal").fill("13001");
    await page.getByLabel("Ville").fill("Marseille");
  }
  await page.getByRole("button", { name: "Continuer vers le paiement →" }).click();
  await page.getByRole("button", { name: /Paiement accepté/ }).click();
  await page.getByRole("button", { name: /^🔒 Payer/ }).click();
  await expect(page.getByRole("heading", { name: "Commande confirmée !" })).toBeVisible();
  return (await page
    .getByText(/CRK-[0-9A-Z]+/)
    .first()
    .textContent())!.match(/CRK-[0-9A-Z]+/)![0];
}

test("historique, détail d'une commande livrée et « commander à nouveau »", async ({ page }) => {
  await connexionDemo(page, "/compte/commandes");
  const commandes = page.getByRole("list", { name: "Mes commandes" }).getByRole("listitem");
  await expect(commandes).toHaveCount(3);
  await expect(commandes.nth(1)).toContainText("Annulée");

  await page.getByRole("link", { name: /CRK-DEMO1/ }).click();
  await expect(page.getByRole("heading", { name: "Commande CRK-DEMO1" })).toBeVisible();
  await expect(page.getByText("Livrée").first()).toBeVisible();
  await expect(page.getByText("Remise (BIENVENUE10)")).toBeVisible();
  await expect(page.getByRole("button", { name: "Annuler la commande" })).toHaveCount(0);

  await page.getByRole("button", { name: "🔁 Commander à nouveau" }).click();
  await expect(page).toHaveURL("/panier");
  await expect(page.getByRole("link", { name: "Box découverte", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Habanero extrême", exact: true })).toBeVisible();
});

test("annulation d'une commande non expédiée : remboursement et remise en stock", async ({ page }) => {
  await connexionDemo(page, "/compte");
  await acheter(page, "habanero-extreme", 2);
  await page.getByRole("link", { name: "Suivre ma commande" }).click();
  await expect(page.getByRole("list", { name: "Suivi de la commande" })).toContainText("Confirmée");

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Annuler la commande" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Commande annulée" })).toBeVisible();
  await expect(page.getByText(/remboursement de\s+11,88/)).toBeVisible(); // 6,98 € + 4,90 € de livraison

  await ouvrir(page, "/produits/habanero-extreme");
  await expect(page.getByText("Plus que 6 en stock")).toBeVisible();
});

test("le statut avance avec le temps : préparation, expédition avec n° de colis, livraison", async ({ page }) => {
  await page.clock.install();
  await connexionDemo(page, "/compte");
  await acheter(page, "sel-de-mer", 1);
  await page.getByRole("link", { name: "Suivre ma commande" }).click();
  const suivi = page.getByRole("list", { name: "Suivi de la commande" });
  await expect(suivi.locator("[aria-current=step]")).toContainText("Confirmée");

  await page.clock.fastForward("03:00");
  await expect(suivi.locator("[aria-current=step]")).toContainText("En préparation");
  await expect(page.getByRole("button", { name: "Annuler la commande" })).toBeVisible();

  await page.clock.fastForward("03:00");
  await expect(suivi.locator("[aria-current=step]")).toContainText("Expédiée");
  await expect(page.getByText(/Colis n°\s+6A\d{11}/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Annuler la commande" })).toHaveCount(0);

  await page.clock.fastForward("05:00");
  await expect(suivi.locator("[aria-current=step]")).toContainText("Livrée");
});

test("suivi invité par numéro et e-mail, puis rattachement au compte créé", async ({ page }) => {
  const id = await acheter(page, "paprika-fume", 1, "camille@example.com");
  await page.getByRole("link", { name: "Suivre ma commande" }).click();
  await expect(page).toHaveURL("/suivi-commande");

  await page.getByLabel("Numéro de commande").fill(id);
  await page.getByLabel("Adresse e-mail de la commande").fill("autre@example.com");
  await page.getByRole("button", { name: "Suivre ma commande" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Aucune commande ne correspond" })).toBeVisible();

  await page.getByLabel("Adresse e-mail de la commande").fill("camille@example.com");
  await page.getByRole("button", { name: "Suivre ma commande" }).click();
  await expect(page.getByRole("heading", { name: `Commande ${id}` })).toBeVisible();
  await expect(
    page.getByRole("term").filter({ hasText: "Total TTC" }).locator("xpath=following-sibling::dd[1]"),
  ).toHaveText(euros("7,69 €")); // 2,79 € + 4,90 €

  await ouvrir(page, "/inscription");
  await page.getByLabel("Prénom").fill("Camille");
  await page.getByLabel("Nom", { exact: true }).fill("Durand");
  await page.getByLabel("Adresse e-mail").fill("camille@example.com");
  await page.getByLabel("Mot de passe").fill("croustille1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL("/compte");
  await expect(page.getByRole("link", { name: new RegExp(`Dernière commande.*${id}`) })).toBeVisible();
});
