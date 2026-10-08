"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/lib/backend/hooks";
import type { PublicUser } from "@/lib/backend";
import { loginUrl } from "@/lib/return-to";

/** Réserve un contenu aux clients connectés ; sinon, renvoie vers la connexion puis ici. */
export function RequireAuth({ children }: { children: (user: PublicUser) => ReactNode }) {
  const user = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) router.replace(loginUrl(pathname));
  }, [user, router, pathname]);

  if (!user) {
    return (
      <div className="space-y-4" aria-busy>
        <div className="h-10 w-64 animate-pulse rounded-xl bg-soft" />
        <div className="h-40 animate-pulse rounded-2xl bg-soft" />
      </div>
    );
  }
  return children(user);
}
