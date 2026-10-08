"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_ACCOUNT, login } from "@/lib/backend";
import { useSession } from "@/lib/backend/hooks";
import { safeReturnTo } from "@/lib/return-to";
import { useAsyncAction } from "@/lib/use-async-action";
import { Field, FormError, SubmitButton } from "../ui/form";

export function LoginForm() {
  const router = useRouter();
  const returnTo = safeReturnTo(useSearchParams().get("retour"));
  const session = useSession();
  const { pending, error, run } = useAsyncAction();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Déjà connecté : inutile de rester sur cette page.
  useEffect(() => {
    if (session && !pending) router.replace(returnTo);
  }, [session, pending, returnTo, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await run(() => login({ email, password }))) router.push(returnTo);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormError>{error}</FormError>
        <Field
          label="Adresse e-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-right text-sm">
          <Link href="/mot-de-passe-oublie" className="font-semibold underline underline-offset-4">
            Mot de passe oublié ?
          </Link>
        </p>
        <SubmitButton pending={pending} pendingLabel="Connexion…">
          Se connecter
        </SubmitButton>
      </form>

      <div className="mt-6 rounded-xl border-2 border-dashed border-foreground/40 bg-primary/15 p-4 text-sm">
        <p className="font-bold">🧪 Compte de démonstration</p>
        <p className="mt-1 text-muted">
          {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
        </p>
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO_ACCOUNT.email);
            setPassword(DEMO_ACCOUNT.password);
          }}
          className="mt-2 font-bold underline underline-offset-4"
        >
          Remplir avec le compte démo
        </button>
      </div>

      <p className="mt-6 text-center text-sm">
        Pas encore de compte ?{" "}
        <Link
          href={returnTo === "/compte" ? "/inscription" : `/inscription?retour=${encodeURIComponent(returnTo)}`}
          className="font-bold underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </>
  );
}
