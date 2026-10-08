import type { ReactNode } from "react";
import { Card } from "../ui/form";

export function AuthLayout({
  emoji,
  title,
  intro,
  children,
}: {
  emoji: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <p className="text-center text-5xl" aria-hidden>
        {emoji}
      </p>
      <h1 className="mt-4 text-center font-display text-4xl font-extrabold">{title}</h1>
      <p className="mt-2 text-center text-muted">{intro}</p>
      <Card className="mt-8">{children}</Card>
    </div>
  );
}

export function FormSkeleton() {
  return <div className="h-72 animate-pulse rounded-xl bg-soft" aria-hidden />;
}
