import { beforeEach, describe, expect, it } from "vitest";
import {
  addressProblem,
  changePassword,
  currentFavorites,
  deleteAccount,
  deleteAddress,
  saveAddress,
  setDefaultAddress,
  toggleFavorite,
  updateProfile,
  type AddressInput,
} from "./account";
import { login, logout, register, sessionUser } from "./auth";
import { DEMO_ACCOUNT } from "./seed";
import { resetDb } from "./store";

const adresse: AddressInput = {
  label: "Maison",
  firstName: "Camille",
  lastName: "Durand",
  line1: "3 place des Frites",
  zip: "13001",
  city: "Marseille",
};

const nouveauCompte = () =>
  register({ email: "camille@example.com", password: "croustille1", firstName: "Camille", lastName: "Durand" });

beforeEach(() => resetDb());

describe("profil", () => {
  it("exige d'être connecté", async () => {
    await expect(updateProfile({ firstName: "A", lastName: "B", email: "a@b.fr" })).rejects.toMatchObject({
      code: "unauthorized",
    });
  });

  it("met à jour le profil et refuse un e-mail déjà pris", async () => {
    await nouveauCompte();
    const user = await updateProfile({ firstName: " Cam ", lastName: "Durand", email: "CAM@example.com" });
    expect(user).toMatchObject({ firstName: "Cam", email: "cam@example.com" });
    await expect(
      updateProfile({ firstName: "Cam", lastName: "Durand", email: DEMO_ACCOUNT.email }),
    ).rejects.toMatchObject({ code: "email_taken" });
  });

  it("change le mot de passe seulement avec le mot de passe actuel", async () => {
    await nouveauCompte();
    await expect(changePassword("faux12345", "nouveau2026")).rejects.toMatchObject({ code: "invalid_credentials" });
    await changePassword("croustille1", "nouveau2026");
    await logout();
    await expect(login({ email: "camille@example.com", password: "nouveau2026" })).resolves.toBeTruthy();
  });

  it("supprime le compte et la session", async () => {
    await nouveauCompte();
    await expect(deleteAccount("mauvais123")).rejects.toMatchObject({ code: "invalid_credentials" });
    await deleteAccount("croustille1");
    expect(sessionUser()).toBeNull();
    await expect(login({ email: "camille@example.com", password: "croustille1" })).rejects.toMatchObject({
      code: "invalid_credentials",
    });
  });
});

describe("adresses", () => {
  it.each<[Partial<AddressInput>, string]>([
    [{ line1: " " }, "Indiquez l'adresse."],
    [{ zip: "7501" }, "Le code postal doit comporter 5 chiffres."],
    [{ phone: "123" }, "Le numéro de téléphone n'est pas valide."],
  ])("refuse une adresse invalide (%j)", (override, message) => {
    expect(addressProblem({ ...adresse, ...override })).toBe(message);
  });

  it("accepte un téléphone français, avec ou sans indicatif", () => {
    expect(addressProblem({ ...adresse, phone: "06 12 34 56 78" })).toBeNull();
    expect(addressProblem({ ...adresse, phone: "+33 6 12 34 56 78" })).toBeNull();
  });

  it("fait de la première adresse l'adresse par défaut, et n'en garde qu'une", async () => {
    await nouveauCompte();
    const maison = await saveAddress(adresse);
    expect(maison.isDefault).toBe(true);
    const bureau = await saveAddress({ ...adresse, label: "Bureau", isDefault: true });
    const adresses = sessionUser()!.addresses;
    expect(adresses.filter((a) => a.isDefault).map((a) => a.id)).toEqual([bureau.id]);

    await setDefaultAddress(maison.id);
    expect(sessionUser()!.addresses.find((a) => a.isDefault)?.id).toBe(maison.id);
  });

  it("modifie une adresse existante", async () => {
    await nouveauCompte();
    const maison = await saveAddress(adresse);
    await saveAddress({ ...adresse, id: maison.id, city: "Aix-en-Provence" });
    expect(sessionUser()!.addresses).toHaveLength(1);
    expect(sessionUser()!.addresses[0].city).toBe("Aix-en-Provence");
  });

  it("réattribue l'adresse par défaut après suppression", async () => {
    await nouveauCompte();
    const maison = await saveAddress(adresse);
    const bureau = await saveAddress({ ...adresse, label: "Bureau" });
    await deleteAddress(maison.id);
    expect(sessionUser()!.addresses).toEqual([expect.objectContaining({ id: bureau.id, isDefault: true })]);
  });
});

describe("favoris", () => {
  it("bascule un favori pour un visiteur", () => {
    toggleFavorite("sel-de-mer");
    expect(currentFavorites()).toEqual(["sel-de-mer"]);
    toggleFavorite("sel-de-mer");
    expect(currentFavorites()).toEqual([]);
  });

  it("refuse un produit inconnu", () => {
    expect(() => toggleFavorite("n-existe-pas")).toThrow("Produit introuvable.");
  });

  it("fusionne les favoris du visiteur dans le compte à la connexion, sans doublon", async () => {
    toggleFavorite("sel-de-mer");
    toggleFavorite("truffe-noire"); // déjà favori du compte démo
    await login(DEMO_ACCOUNT);
    expect(currentFavorites()).toEqual(["truffe-noire", "paprika-fume", "habanero-extreme", "sel-de-mer"]);
    await logout();
    expect(currentFavorites()).toEqual([]);
  });
});
