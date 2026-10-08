import type { InputHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border-2 border-foreground bg-surface px-4 py-3 text-sm outline-none focus:bg-primary/15 focus:shadow-pop-sm aria-invalid:border-sale";

/** Champ avec un vrai `<label>` visible : le placeholder seul n'est pas accessible (cf. #9). */
export function Field({
  label,
  hint,
  className = "",
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-bold">
        {label}
        {!input.required && <span className="font-normal text-muted"> (facultatif)</span>}
      </span>
      <input className={inputClass} {...input} />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl border-2 border-sale bg-sale/10 px-4 py-3 text-sm font-semibold text-sale">
      {children}
    </p>
  );
}

export function FormSuccess({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="rounded-xl border-2 border-green bg-green/15 px-4 py-3 text-sm font-semibold">
      {children}
    </p>
  );
}

export function SubmitButton({
  pending,
  children,
  pendingLabel = "Un instant…",
  className = "",
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`btn w-full bg-primary ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border-2 border-foreground bg-surface p-6 shadow-pop-lg sm:p-8 ${className}`}>
      {children}
    </div>
  );
}
