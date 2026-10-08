import { beforeEach, describe, expect, it } from "vitest";
import {
  isValidEmail,
  login,
  logout,
  passwordProblem,
  register,
  requestPasswordReset,
  resetPassword,
  sessionUser,
} from "./auth";
import { DEMO_ACCOUNT } from "./seed";
import { readDb, resetDb } from "./store";

const camille = { email: "Camille@Example.com ", password: "croustille1", firstName: "Camille", lastName: "Durand" };

describe("validation", () => {
  it("vérifie le format de l'e-mail", () => {
    expect(isValidEmail("a@b.fr")).toBe(true);
    expect(isValidEmail("pas-un-email")).toBe(false);
  });

  it.each([
    ["court1", "au moins 8"],
    ["seulementdeslettres", "une lettre et un chiffre"],
    ["12345678", "une lettre et un chiffre"],
  ])("refuse le mot de passe %j", (pw, msg) => {
    expect(passwordProblem(pw)).toContain(msg);
  });

  it("accepte un mot de passe correct", () => {
    expect(passwordProblem("croustille1")).toBeNull();
  });
});

describe("comptes", () => {
  beforeEach(() => resetDb());

  it("connecte le compte de démonstration", async () => {
    const user = await login(DEMO_ACCOUNT);
    expect(user.firstName).toBe("Alex");
    expect(sessionUser()?.email).toBe(DEMO_ACCOUNT.email);
  });

  it("crée un compte, normalise l'e-mail, hache le mot de passe et ouvre la session", async () => {
    const user = await register(camille);
    expect(user.email).toBe("camille@example.com");
    expect(user).not.toHaveProperty("passwordHash");
    const stored = readDb().users.find((u) => u.id === user.id)!;
    expect(stored.passwordHash).not.toContain(camille.password);
    expect(sessionUser()?.id).toBe(user.id);
  });

  it("refuse un e-mail déjà utilisé, quelle que soit la casse", async () => {
    await register(camille);
    await expect(register({ ...camille, email: "CAMILLE@example.com" })).rejects.toMatchObject({ code: "email_taken" });
  });

  it("refuse un mot de passe faible", async () => {
    await expect(register({ ...camille, password: "abc" })).rejects.toMatchObject({ code: "weak_password" });
  });

  it("déconnecte puis reconnecte", async () => {
    await register(camille);
    await logout();
    expect(sessionUser()).toBeNull();
    await login({ email: camille.email, password: camille.password });
    expect(sessionUser()?.firstName).toBe("Camille");
  });

  it("donne le même message pour un e-mail inconnu et un mauvais mot de passe", async () => {
    await register(camille);
    const wrongPassword = await login({ email: camille.email, password: "mauvais123" }).catch((e) => e);
    const unknownEmail = await login({ email: "inconnu@example.com", password: "mauvais123" }).catch((e) => e);
    expect(wrongPassword.message).toBe(unknownEmail.message);
    expect(wrongPassword.code).toBe("invalid_credentials");
  });
});

describe("mot de passe oublié", () => {
  beforeEach(() => resetDb());

  it("ne signale pas si le compte existe", async () => {
    expect(await requestPasswordReset("inconnu@example.com")).toEqual({ simulatedEmail: null });
  });

  it("réinitialise avec un lien à usage unique et ferme les sessions", async () => {
    await login(DEMO_ACCOUNT);
    const { simulatedEmail } = await requestPasswordReset(DEMO_ACCOUNT.email);
    await resetPassword(simulatedEmail!.token, "nouveau2026");

    expect(sessionUser()).toBeNull();
    await expect(login(DEMO_ACCOUNT)).rejects.toMatchObject({ code: "invalid_credentials" });
    await expect(login({ email: DEMO_ACCOUNT.email, password: "nouveau2026" })).resolves.toBeTruthy();
    await expect(resetPassword(simulatedEmail!.token, "encoreun1")).rejects.toMatchObject({ code: "invalid_token" });
  });

  it("refuse un lien inconnu", async () => {
    await expect(resetPassword("faux", "nouveau2026")).rejects.toMatchObject({ code: "invalid_token" });
  });
});
