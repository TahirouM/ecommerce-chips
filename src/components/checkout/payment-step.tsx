"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cancelThreeDSecure, confirmThreeDSecure, placeOrder, type Order } from "@/lib/backend";
import {
  cardBrand,
  DEMO_3DS_CODE,
  formatCardNumber,
  formatExpiry,
  TEST_CARDS,
  validateCard,
  type CardErrors,
  type CardInput,
} from "@/lib/card";
import { cart, setPromoCode, useCart, usePromoCode } from "@/lib/cart";
import { computeTotals } from "@/lib/cart-state";
import { saveLastOrder } from "@/lib/last-order";
import { formatPrice } from "@/lib/products";
import { useAsyncAction } from "@/lib/use-async-action";
import { usePromo } from "../order-summary";
import { Field, FormError, SubmitButton } from "../ui/form";
import type { Delivery } from "./checkout";

const BRAND_LABEL = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", carte: "Carte" };

function ThreeDSecureDialog({
  amount,
  onConfirm,
  onCancel,
}: {
  amount: number;
  onConfirm: (code: string) => Promise<void>;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { pending, error, run } = useAsyncAction();

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="tds-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(92vw,26rem)] rounded-2xl border-2 border-foreground bg-surface p-0 shadow-pop-lg backdrop:bg-foreground/60"
    >
      <div className="bg-foreground px-6 py-4 text-background">
        <p className="text-xs font-bold tracking-widest uppercase opacity-70">Banque Patate · 3-D Secure</p>
        <h2 id="tds-title" className="mt-1 font-display text-xl font-extrabold">
          Confirmez votre paiement
        </h2>
      </div>
      <form
        className="space-y-5 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const code = String(new FormData(e.currentTarget).get("code"));
          await run(() => onConfirm(code));
        }}
      >
        <p className="text-sm">
          Paiement de <strong className="tabular-nums">{formatPrice(amount)}</strong> à <strong>CRAAK!</strong>.
          Saisissez le code reçu par SMS.
        </p>
        <FormError>{error}</FormError>
        <Field
          label="Code de vérification"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          hint={`Démo : le code est ${DEMO_3DS_CODE}.`}
        />
        <div className="flex flex-wrap gap-3">
          <SubmitButton pending={pending} pendingLabel="Vérification…" className="sm:w-auto">
            Valider
          </SubmitButton>
          <button type="button" onClick={onCancel} disabled={pending} className="btn bg-surface">
            Annuler le paiement
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function PaymentStep({
  email,
  delivery,
  onPlacing,
}: {
  email: string;
  delivery: Delivery;
  onPlacing: (placing: boolean) => void;
}) {
  const router = useRouter();
  const { lines, subtotal } = useCart();
  const promoCode = usePromoCode();
  const { promo } = usePromo(subtotal);
  const total = computeTotals(subtotal, delivery.shippingId, promo).total;
  const [card, setCard] = useState<CardInput>({ name: "", number: "", expiry: "", cvc: "" });
  const [fieldErrors, setFieldErrors] = useState<CardErrors>({});
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const { pending, error, setError, run } = useAsyncAction();

  function succeed(order: Order) {
    // On quitte le tunnel : le panier vide ne doit pas afficher « panier vide » entre-temps.
    onPlacing(true);
    saveLastOrder({ id: order.id, email: order.email });
    cart.clear();
    setPromoCode(null);
    router.push("/commande/confirmation");
  }

  const set = (key: keyof CardInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const value = key === "number" ? formatCardNumber(raw) : key === "expiry" ? formatExpiry(raw) : raw;
    setCard((c) => ({ ...c, [key]: value }));
    setFieldErrors((f) => ({ ...f, [key]: undefined }));
  };

  return (
    <>
      <form
        noValidate
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const errors = validateCard(card);
          setFieldErrors(errors);
          if (Object.keys(errors).length) return setError("Vérifiez les informations de votre carte.");
          const result = await run(() =>
            placeOrder({
              items: lines.map(({ slug, quantity }) => ({ slug, quantity })),
              shippingId: delivery.shippingId,
              promoCode: promo ? promoCode : null,
              email,
              address: delivery.address,
              saveAddress: delivery.saveAddress,
              card,
            }),
          );
          if (result?.status === "succeeded") succeed(result.order);
          if (result?.status === "requires_action") setCheckoutId(result.checkoutId);
        }}
      >
        <FormError>{error}</FormError>
        <Field
          label="Nom sur la carte"
          name="cc-name"
          autoComplete="cc-name"
          required
          value={card.name}
          onChange={set("name")}
          aria-invalid={!!fieldErrors.name}
          hint={fieldErrors.name}
        />
        <Field
          label="Numéro de carte"
          name="cc-number"
          autoComplete="cc-number"
          inputMode="numeric"
          required
          value={card.number}
          onChange={set("number")}
          aria-invalid={!!fieldErrors.number}
          hint={fieldErrors.number ?? (card.number.length > 1 ? BRAND_LABEL[cardBrand(card.number)] : undefined)}
        />
        <div className="grid grid-cols-2 gap-5">
          <Field
            label="Expiration (MM/AA)"
            name="cc-exp"
            autoComplete="cc-exp"
            inputMode="numeric"
            required
            value={card.expiry}
            onChange={set("expiry")}
            aria-invalid={!!fieldErrors.expiry}
            hint={fieldErrors.expiry}
          />
          <Field
            label="Cryptogramme"
            name="cc-csc"
            autoComplete="cc-csc"
            inputMode="numeric"
            maxLength={4}
            required
            value={card.cvc}
            onChange={set("cvc")}
            aria-invalid={!!fieldErrors.cvc}
            hint={fieldErrors.cvc}
          />
        </div>

        <div className="rounded-xl border-2 border-dashed border-foreground/40 bg-primary/15 p-4 text-sm">
          <p className="font-bold">🧪 Cartes de test (aucun paiement réel)</p>
          <ul className="mt-2 space-y-1.5">
            {TEST_CARDS.map((c) => (
              <li key={c.number}>
                <button
                  type="button"
                  onClick={() => {
                    setCard({ name: card.name || "Client Démo", number: c.number, expiry: "12/30", cvc: "123" });
                    setFieldErrors({});
                    setError(null);
                  }}
                  className="text-left underline-offset-4 hover:underline"
                >
                  <span className="font-mono tabular-nums">{c.number}</span> · {c.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <SubmitButton pending={pending} pendingLabel="Paiement en cours…">
          🔒 Payer {formatPrice(total)}
        </SubmitButton>
      </form>

      {checkoutId && (
        <ThreeDSecureDialog
          amount={total}
          onConfirm={async (code) => {
            const order = await confirmThreeDSecure(checkoutId, code);
            setCheckoutId(null);
            succeed(order);
          }}
          onCancel={async () => {
            const id = checkoutId;
            setCheckoutId(null);
            await cancelThreeDSecure(id);
            setError("Paiement annulé : l'authentification 3-D Secure n'a pas été validée.");
          }}
        />
      )}
    </>
  );
}
