"use client";

import Link from "next/link";
import { useState } from "react";
import { addressProblem, isValidEmail, type Address, type ShippingAddress } from "@/lib/backend";
import { useSession } from "@/lib/backend/hooks";
import { useCart } from "@/lib/cart";
import { computeTotals } from "@/lib/cart-state";
import { formatPrice, SHIPPING_OPTIONS, type ShippingId } from "@/lib/products";
import { AddressFields, AddressLines, readAddressForm } from "../account/address-form";
import { OrderSummary, usePromo } from "../order-summary";
import { Field, FormError } from "../ui/form";
import { PaymentStep } from "./payment-step";

type Step = "identification" | "livraison" | "paiement";

export type Delivery = {
  address: { addressId: string } | ShippingAddress;
  preview: ShippingAddress;
  saveAddress: boolean;
  shippingId: ShippingId;
};

const STEPS: { id: Step; label: string }[] = [
  { id: "identification", label: "Identification" },
  { id: "livraison", label: "Livraison" },
  { id: "paiement", label: "Paiement" },
];

function StepCard({
  index,
  title,
  active,
  done,
  summary,
  onEdit,
  children,
}: {
  index: number;
  title: string;
  active: boolean;
  done: boolean;
  summary?: React.ReactNode;
  onEdit?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-current={active ? "step" : undefined}
      className={`rounded-2xl border-2 border-foreground bg-surface p-5 sm:p-7 ${active ? "shadow-pop-lg" : "opacity-90"}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground font-bold ${
            done ? "bg-green" : active ? "bg-primary" : "bg-soft"
          }`}
          aria-hidden
        >
          {done ? "✓" : index}
        </span>
        <h2 className="font-display text-xl font-extrabold">{title}</h2>
        {done && onEdit && (
          <button type="button" onClick={onEdit} className="ml-auto text-sm font-bold underline underline-offset-4">
            Modifier
          </button>
        )}
      </div>
      {done && !active && summary && <div className="mt-4 pl-12 text-sm">{summary}</div>}
      {active && <div className="mt-6">{children}</div>}
    </section>
  );
}

function IdentificationStep({ email, onGuest }: { email: string; onGuest: (email: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border-2 border-dashed border-foreground/40 p-5">
        <p className="font-bold">Déjà client ?</p>
        <p className="mt-1 text-sm text-muted">Retrouvez vos adresses et suivez votre commande.</p>
        <Link href="/connexion?retour=%2Fcommande" className="mt-4 btn w-full bg-primary">
          Se connecter
        </Link>
        <Link
          href="/inscription?retour=%2Fcommande"
          className="mt-3 block text-center text-sm font-bold underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const value = String(new FormData(e.currentTarget).get("email"));
          if (!isValidEmail(value)) return setError("Indiquez une adresse e-mail valide.");
          onGuest(value.trim());
        }}
      >
        <p className="font-bold">Commander en invité</p>
        <FormError>{error}</FormError>
        <Field
          label="Adresse e-mail"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={email}
          required
          hint="Pour la confirmation et le suivi de commande."
        />
        <button type="submit" className="btn w-full bg-surface">
          Continuer en invité
        </button>
      </form>
    </div>
  );
}

function DeliveryStep({
  addresses,
  initial,
  canSave,
  onDone,
}: {
  addresses: Address[];
  initial: Delivery | null;
  canSave: boolean;
  onDone: (delivery: Delivery) => void;
}) {
  const { subtotal } = useCart();
  const { promo } = usePromo(subtotal);
  const defaultId = addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id;
  const initialChoice =
    initial && "addressId" in initial.address ? initial.address.addressId : initial ? "new" : (defaultId ?? "new");
  const [choice, setChoice] = useState<string>(initialChoice);
  const [shippingId, setShippingId] = useState<ShippingId>(initial?.shippingId ?? "standard");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (choice !== "new") {
          const a = addresses.find((x) => x.id === choice)!;
          return onDone({ address: { addressId: a.id }, preview: a, saveAddress: false, shippingId });
        }
        const input = readAddressForm(e.currentTarget);
        const problem = addressProblem(input);
        if (problem) return setError(problem);
        const address: ShippingAddress = {
          firstName: input.firstName,
          lastName: input.lastName,
          line1: input.line1,
          line2: input.line2,
          zip: input.zip,
          city: input.city,
          phone: input.phone,
        };
        onDone({
          address,
          preview: address,
          saveAddress: new FormData(e.currentTarget).get("saveAddress") === "on",
          shippingId,
        });
      }}
    >
      <fieldset>
        <legend className="mb-4 font-bold">Adresse de livraison</legend>
        <FormError>{error}</FormError>
        {addresses.length > 0 && (
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            {[...addresses.map((a) => ({ id: a.id, a })), { id: "new", a: null }].map(({ id, a }) => (
              <label
                key={id}
                className="flex cursor-pointer gap-3 rounded-xl border-2 border-foreground p-4 has-checked:bg-primary/25 has-checked:shadow-pop-sm"
              >
                <input
                  type="radio"
                  name="addressChoice"
                  value={id}
                  checked={choice === id}
                  onChange={() => setChoice(id)}
                  className="mt-1 size-4 accent-[var(--foreground)]"
                />
                {a ? (
                  <span>
                    <span className="block font-bold">{a.label}</span>
                    <AddressLines address={a} />
                  </span>
                ) : (
                  <span className="font-bold">＋ Nouvelle adresse</span>
                )}
              </label>
            ))}
          </div>
        )}
        {choice === "new" && (
          <div className="space-y-5">
            <AddressFields
              initial={initial && !("addressId" in initial.address) ? initial.preview : undefined}
              withLabel={false}
            />
            {canSave && (
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="saveAddress"
                  defaultChecked
                  className="size-5 accent-[var(--foreground)]"
                />
                Enregistrer cette adresse dans mon carnet
              </label>
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-4 font-bold">Mode de livraison</legend>
        {SHIPPING_OPTIONS.map((o) => {
          const price = computeTotals(subtotal, o.id, promo).shipping;
          return (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-foreground bg-surface px-4 py-3 text-sm font-semibold has-checked:bg-primary has-checked:shadow-pop-sm"
            >
              <input
                type="radio"
                name="shipping"
                value={o.id}
                checked={shippingId === o.id}
                onChange={() => setShippingId(o.id)}
                className="size-4 accent-[var(--foreground)]"
              />
              <span className="flex-1">{o.label}</span>
              <span className="tabular-nums">{price === 0 ? "Offerte" : formatPrice(price)}</span>
            </label>
          );
        })}
      </fieldset>

      <button type="submit" className="btn w-full bg-primary sm:w-auto">
        Continuer vers le paiement →
      </button>
    </form>
  );
}

export function Checkout() {
  const user = useSession();
  const { lines } = useCart();
  const [guestEmail, setGuestEmail] = useState("");
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [requested, setRequested] = useState<Step | null>(null);
  const [placing, setPlacing] = useState(false);

  if (user === undefined) return <div className="mt-10 h-96 animate-pulse rounded-2xl bg-soft" aria-hidden />;

  if (lines.length === 0 && !placing) {
    return (
      <div className="py-24 text-center">
        <p className="text-6xl">🥔</p>
        <p className="mt-4 text-lg text-muted">Votre panier est vide.</p>
        <Link href="/produits" className="mt-8 btn bg-primary">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const identified = !!user || !!guestEmail;
  // Étape courante : la première incomplète, sauf si le client revient sur une étape précédente.
  const firstIncomplete: Step = !identified ? "identification" : !delivery ? "livraison" : "paiement";
  const order = STEPS.map((s) => s.id);
  const step = requested && order.indexOf(requested) < order.indexOf(firstIncomplete) ? requested : firstIncomplete;
  const isDone = (s: Step) => order.indexOf(s) < order.indexOf(firstIncomplete) && s !== step;
  const goTo = (s: Step) => setRequested(s);
  const email = user?.email ?? guestEmail;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-5">
        <StepCard
          index={1}
          title="Identification"
          active={step === "identification"}
          done={isDone("identification") || (!!user && step !== "identification")}
          onEdit={user ? undefined : () => goTo("identification")}
          summary={
            user ? (
              <p>
                Connecté en tant que{" "}
                <strong>
                  {user.firstName} {user.lastName}
                </strong>{" "}
                ({user.email})
              </p>
            ) : (
              <p>
                Invité · <strong>{guestEmail}</strong>
              </p>
            )
          }
        >
          <IdentificationStep
            email={guestEmail}
            onGuest={(value) => {
              setGuestEmail(value);
              setRequested(null);
            }}
          />
        </StepCard>

        <StepCard
          index={2}
          title="Livraison"
          active={step === "livraison"}
          done={isDone("livraison")}
          onEdit={() => goTo("livraison")}
          summary={
            delivery && (
              <div className="flex flex-wrap gap-x-10 gap-y-3">
                <AddressLines address={{ ...delivery.preview, id: "", label: "", isDefault: false }} />
                <p>{SHIPPING_OPTIONS.find((o) => o.id === delivery.shippingId)?.label}</p>
              </div>
            )
          }
        >
          <DeliveryStep
            addresses={user?.addresses ?? []}
            initial={delivery}
            canSave={!!user}
            onDone={(d) => {
              setDelivery(d);
              setRequested(null);
            }}
          />
        </StepCard>

        <StepCard index={3} title="Paiement" active={step === "paiement"} done={false}>
          {delivery && <PaymentStep email={email} delivery={delivery} onPlacing={setPlacing} />}
        </StepCard>
      </div>

      <OrderSummary shippingId={delivery?.shippingId} withPromo>
        <ul className="mt-6 space-y-2 border-t-2 border-dashed border-foreground/30 pt-4 text-sm">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-2">
              <span className="text-muted">
                {l.quantity} × {l.product.name}
              </span>
              <span className="tabular-nums">{formatPrice(l.total)}</span>
            </li>
          ))}
        </ul>
      </OrderSummary>
    </div>
  );
}
