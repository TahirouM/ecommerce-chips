"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changePassword, deleteAccount, updateProfile } from "@/lib/backend";
import { useAsyncAction } from "@/lib/use-async-action";
import { Card, Field, FormError, FormSuccess, SubmitButton } from "../ui/form";
import { useUser } from "./account-shell";
import { PageTitle } from "./page-title";

function Section({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <Card className={danger ? "border-sale" : ""}>
      <h2 className={`font-display text-xl font-extrabold ${danger ? "text-sale" : ""}`}>{title}</h2>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function ProfileForm() {
  const user = useUser();
  const { pending, error, run } = useAsyncAction();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaved(false);
        const data = new FormData(e.currentTarget);
        const ok = await run(() =>
          updateProfile({
            firstName: String(data.get("firstName")),
            lastName: String(data.get("lastName")),
            email: String(data.get("email")),
          }),
        );
        if (ok) setSaved(true);
      }}
    >
      <FormError>{error}</FormError>
      <FormSuccess>{saved && "Vos informations sont à jour."}</FormSuccess>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Prénom" name="firstName" defaultValue={user.firstName} autoComplete="given-name" required />
        <Field label="Nom" name="lastName" defaultValue={user.lastName} autoComplete="family-name" required />
      </div>
      <Field label="Adresse e-mail" name="email" type="email" defaultValue={user.email} autoComplete="email" required />
      <SubmitButton pending={pending} className="sm:w-auto">
        Enregistrer
      </SubmitButton>
    </form>
  );
}

function PasswordForm() {
  const { pending, error, run } = useAsyncAction();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaved(false);
        const form = e.currentTarget;
        const data = new FormData(form);
        const ok = await run(() =>
          changePassword(String(data.get("current")), String(data.get("next"))).then(() => true),
        );
        if (ok) {
          form.reset();
          setSaved(true);
        }
      }}
    >
      <FormError>{error}</FormError>
      <FormSuccess>{saved && "Mot de passe modifié."}</FormSuccess>
      <Field label="Mot de passe actuel" name="current" type="password" autoComplete="current-password" required />
      <Field
        label="Nouveau mot de passe"
        name="next"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="8 caractères minimum, dont une lettre et un chiffre."
      />
      <SubmitButton pending={pending} className="sm:w-auto">
        Changer le mot de passe
      </SubmitButton>
    </form>
  );
}

function DeleteAccount() {
  const router = useRouter();
  const { pending, error, run } = useAsyncAction();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <>
        <p className="text-sm text-muted">
          Vos informations, adresses et favoris seront définitivement effacés. Cette action est irréversible.
        </p>
        <button type="button" onClick={() => setOpen(true)} className="mt-5 btn bg-surface text-sale">
          Supprimer mon compte
        </button>
      </>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const password = String(new FormData(e.currentTarget).get("password"));
        if (await run(() => deleteAccount(password).then(() => true))) router.push("/");
      }}
    >
      <FormError>{error}</FormError>
      <Field
        label="Confirmez avec votre mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="btn bg-sale text-white">
          {pending ? "Suppression…" : "Supprimer définitivement"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn bg-surface">
          Annuler
        </button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  return (
    <>
      <PageTitle intro="Vos informations personnelles et votre sécurité.">Mon profil</PageTitle>
      <div className="space-y-8">
        <Section title="Informations">
          <ProfileForm />
        </Section>
        <Section title="Mot de passe">
          <PasswordForm />
        </Section>
        <Section title="Supprimer mon compte" danger>
          <DeleteAccount />
        </Section>
      </div>
    </>
  );
}
