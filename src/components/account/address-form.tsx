"use client";

import type { Address, AddressInput } from "@/lib/backend";
import { Field, FormError, SubmitButton } from "../ui/form";

export function readAddressForm(form: HTMLFormElement): AddressInput {
  const data = new FormData(form);
  const get = (k: string) => String(data.get(k) ?? "");
  return {
    label: get("label"),
    firstName: get("firstName"),
    lastName: get("lastName"),
    line1: get("line1"),
    line2: get("line2"),
    zip: get("zip"),
    city: get("city"),
    phone: get("phone"),
    isDefault: data.get("isDefault") === "on",
  };
}

/** Champs d'une adresse de livraison, partagés par le carnet d'adresses et le tunnel de commande. */
export function AddressFields({ initial, withLabel = true }: { initial?: Partial<Address>; withLabel?: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {withLabel && (
        <Field
          label="Nom de l'adresse"
          name="label"
          defaultValue={initial?.label}
          placeholder="Maison, Bureau…"
          className="sm:col-span-2"
        />
      )}
      <Field label="Prénom" name="firstName" defaultValue={initial?.firstName} autoComplete="given-name" required />
      <Field label="Nom" name="lastName" defaultValue={initial?.lastName} autoComplete="family-name" required />
      <Field
        label="Adresse"
        name="line1"
        defaultValue={initial?.line1}
        autoComplete="address-line1"
        required
        className="sm:col-span-2"
      />
      <Field
        label="Complément d'adresse"
        name="line2"
        defaultValue={initial?.line2}
        autoComplete="address-line2"
        placeholder="Bâtiment, étage, digicode…"
        className="sm:col-span-2"
      />
      <Field
        label="Code postal"
        name="zip"
        defaultValue={initial?.zip}
        autoComplete="postal-code"
        inputMode="numeric"
        pattern="\d{5}"
        title="5 chiffres"
        required
      />
      <Field label="Ville" name="city" defaultValue={initial?.city} autoComplete="address-level2" required />
      <Field
        label="Téléphone"
        name="phone"
        type="tel"
        defaultValue={initial?.phone}
        autoComplete="tel"
        hint="Pour le livreur, en cas de besoin."
        className="sm:col-span-2"
      />
    </div>
  );
}

export function AddressForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Address>;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: (address: AddressInput) => void;
  onCancel?: () => void;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(readAddressForm(e.currentTarget));
      }}
    >
      <FormError>{error}</FormError>
      <AddressFields initial={initial} />
      {!initial?.isDefault && (
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="isDefault" className="size-5 accent-[var(--foreground)]" />
          Utiliser comme adresse par défaut
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        <SubmitButton pending={pending} className="sm:w-auto">
          {submitLabel}
        </SubmitButton>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn bg-surface">
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

export function AddressLines({ address }: { address: Address }) {
  return (
    <address className="text-sm leading-relaxed not-italic">
      {address.firstName} {address.lastName}
      <br />
      {address.line1}
      {address.line2 && (
        <>
          <br />
          {address.line2}
        </>
      )}
      <br />
      {address.zip} {address.city}
      {address.phone && (
        <>
          <br />
          {address.phone}
        </>
      )}
    </address>
  );
}
