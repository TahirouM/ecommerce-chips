"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { passwordProblem, register } from "@/lib/backend";
import { safeReturnTo } from "@/lib/return-to";
import { useAsyncAction } from "@/lib/use-async-action";
import { Field, FormError, SubmitButton } from "../ui/form";

export function RegisterForm() {
  const router = useRouter();
  const returnTo = safeReturnTo(useSearchParams().get("retour"));
  const { pending, error, run } = useAsyncAction();
  const [password, setPassword] = useState("");
  const problem = password ? passwordProblem(password) : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const user = await run(() =>
      register({
        firstName: String(data.get("firstName")),
        lastName: String(data.get("lastName")),
        email: String(data.get("email")),
        password,
      }),
    );
    if (user) router.push(returnTo);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormError>{error}</FormError>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" name="firstName" autoComplete="given-name" required />
          <Field label="Nom" name="lastName" autoComplete="family-name" required />
        </div>
        <Field label="Adresse e-mail" type="email" name="email" autoComplete="email" required />
        <Field
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!problem}
          hint={problem ?? "8 caractères minimum, dont une lettre et un chiffre."}
        />
        <SubmitButton pending={pending} pendingLabel="Création du compte…">
          Créer mon compte
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm">
        Déjà client ?{" "}
        <Link href="/connexion" className="font-bold underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </>
  );
}
