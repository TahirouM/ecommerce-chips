import type { ReactNode } from "react";

export function PageTitle({ children, intro }: { children: ReactNode; intro?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{children}</h1>
      {intro && <p className="mt-2 text-muted">{intro}</p>}
    </div>
  );
}
