"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset, resetPassword } from "@/lib/backend";
import { useAsyncAction } from "@/lib/use-async-action";
import { Field, FormError, FormSuccess, SubmitButton } from "../ui/form";

type SimulatedEmail = { to: string; firstName: string; token: string } | null;

export function ForgotPassword() {
  const [step, setStep] = useState<"request" | "sent" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [mail, setMail] = useState<SimulatedEmail>(null);
  const [token, setToken] = useState("");
  const { pending, error, run } = useAsyncAction();

  if (step === "done") {
    return (
      <div className="space-y-6">
        <FormSuccess>Votre mot de passe a été modifié. Vous pouvez vous reconnecter.</FormSuccess>
        <Link href="/connexion" className="btn w-full bg-primary">
          Se connecter
        </Link>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const password = String(new FormData(e.currentTarget).get("password"));
          if ((await run(() => resetPassword(token, password).then(() => true))) === true) setStep("done");
        }}
      >
        <FormError>{error}</FormError>
        <Field
          label="Nouveau mot de passe"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="8 caractères minimum, dont une lettre et un chiffre."
        />
        <SubmitButton pending={pending}>Enregistrer le mot de passe</SubmitButton>
      </form>
    );
  }

  if (step === "sent") {
    return (
      <div className="space-y-6">
        <FormSuccess>
          Si un compte existe pour {email}, un e-mail de réinitialisation vient d&apos;être envoyé.
        </FormSuccess>
        {mail ? (
          <article
            aria-label="E-mail reçu (simulation)"
            className="rounded-xl border-2 border-dashed border-foreground/40 bg-background p-5 text-sm"
          >
            <p className="text-xs font-bold tracking-wide text-muted uppercase">📬 Boîte mail simulée</p>
            <p className="mt-3">
              <strong>À :</strong> {mail.to}
              <br />
              <strong>Objet :</strong> Réinitialisez votre mot de passe CRAAK!
            </p>
            <p className="mt-3">
              Bonjour {mail.firstName}, cliquez ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 30
              minutes et ne peut servir qu&apos;une fois.
            </p>
            <button
              type="button"
              onClick={() => {
                setToken(mail.token);
                setStep("reset");
              }}
              className="mt-4 btn bg-primary"
            >
              Réinitialiser mon mot de passe
            </button>
          </article>
        ) : (
          <p className="text-sm text-muted">
            (Démo : aucun compte n&apos;existe pour cette adresse, aucun e-mail n&apos;est donc arrivé.)
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await run(() => requestPasswordReset(email));
        if (result) {
          setMail(result.simulatedEmail);
          setStep("sent");
        }
      }}
    >
      <FormError>{error}</FormError>
      <Field
        label="Adresse e-mail du compte"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <SubmitButton pending={pending}>Recevoir un lien</SubmitButton>
    </form>
  );
}
