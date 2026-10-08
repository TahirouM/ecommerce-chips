import { STATUS_LABELS, STATUS_STEPS, stepDate, type OrderStatus } from "@/lib/order-status";
import type { Order } from "@/lib/backend";

const BADGE: Record<OrderStatus, string> = {
  confirmee: "bg-blue/20",
  preparation: "bg-primary",
  expediee: "bg-orange/60",
  livree: "bg-green/60",
  annulee: "bg-soft text-muted line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold ${BADGE[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const time = (d: Date) =>
  d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Frise de suivi : étapes franchies, étape en cours, étapes à venir. */
export function OrderTimeline({ order, status }: { order: Order; status: OrderStatus }) {
  if (status === "annulee") {
    return (
      <p className="rounded-xl border-2 border-dashed border-foreground/40 bg-soft px-4 py-3 text-sm">
        Commande annulée le {time(new Date(order.cancelledAt!))}. Le remboursement de{" "}
        {(order.total / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} a été effectué sur la
        carte •••• {order.payment.last4} (simulation).
      </p>
    );
  }
  const current = STATUS_STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="grid gap-3 sm:grid-cols-4" aria-label="Suivi de la commande">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li
            key={step.status}
            aria-current={i === current ? "step" : undefined}
            className="flex items-center gap-3 sm:flex-col sm:items-start"
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-foreground text-sm font-bold ${
                i === current ? "bg-primary" : done ? "bg-green" : "bg-surface text-muted"
              }`}
              aria-hidden
            >
              {done ? "✓" : i + 1}
            </span>
            <span>
              <span className={`block text-sm font-bold ${done ? "" : "text-muted"}`}>{step.label}</span>
              <span className="block text-xs text-muted">{done ? time(stepDate(order, step.after)) : "À venir"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
