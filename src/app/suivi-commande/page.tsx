import type { Metadata } from "next";
import { TrackOrder } from "@/components/orders/track-order";

export const metadata: Metadata = { title: "Suivre une commande" };

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center print:hidden">
        <p className="text-5xl" aria-hidden>
          📦
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold">Suivre une commande</h1>
        <p className="mt-2 text-muted">Sans compte : il suffit du numéro de commande et de votre e-mail.</p>
      </div>
      <TrackOrder />
    </div>
  );
}
