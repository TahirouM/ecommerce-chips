"use client";

import { useState } from "react";
import { deleteAddress, saveAddress, setDefaultAddress, type Address } from "@/lib/backend";
import { useAsyncAction } from "@/lib/use-async-action";
import { Card, FormError } from "../ui/form";
import { useUser } from "./account-shell";
import { AddressForm, AddressLines } from "./address-form";
import { PageTitle } from "./page-title";

type Editing = { mode: "new" } | { mode: "edit"; address: Address } | null;

export function AddressBook() {
  const user = useUser();
  const [editing, setEditing] = useState<Editing>(null);
  const form = useAsyncAction();
  const actions = useAsyncAction();

  if (editing) {
    const isNew = editing.mode === "new";
    return (
      <>
        <PageTitle>{isNew ? "Nouvelle adresse" : "Modifier l'adresse"}</PageTitle>
        <Card>
          <AddressForm
            initial={isNew ? { firstName: user.firstName, lastName: user.lastName } : editing.address}
            submitLabel={isNew ? "Ajouter l'adresse" : "Enregistrer"}
            pending={form.pending}
            error={form.error}
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              const saved = await form.run(() => saveAddress(isNew ? input : { ...input, id: editing.address.id }));
              if (saved) setEditing(null);
            }}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle intro="Choisissez-en une en un clic au moment de commander.">Mes adresses</PageTitle>
      <FormError>{actions.error}</FormError>
      <ul className="grid gap-5 sm:grid-cols-2">
        {user.addresses.map((a) => (
          <li key={a.id}>
            <Card className="flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-extrabold">{a.label}</p>
                {a.isDefault && (
                  <span className="rounded-full border-2 border-foreground bg-primary px-2.5 py-0.5 text-xs font-bold">
                    Par défaut
                  </span>
                )}
              </div>
              <div className="mt-3 flex-1">
                <AddressLines address={a} />
              </div>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setEditing({ mode: "edit", address: a })}
                  className="underline underline-offset-4"
                >
                  Modifier
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    disabled={actions.pending}
                    onClick={() => actions.run(() => setDefaultAddress(a.id))}
                    className="underline underline-offset-4"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  type="button"
                  disabled={actions.pending}
                  onClick={() =>
                    confirm(`Supprimer l'adresse « ${a.label} » ?`) && actions.run(() => deleteAddress(a.id))
                  }
                  className="text-sale underline underline-offset-4"
                  aria-label={`Supprimer l'adresse ${a.label}`}
                >
                  Supprimer
                </button>
              </div>
            </Card>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => setEditing({ mode: "new" })}
            className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/50 p-6 font-bold hover:bg-primary/20"
          >
            <span className="text-3xl" aria-hidden>
              ＋
            </span>
            Ajouter une adresse
          </button>
        </li>
      </ul>
    </>
  );
}
