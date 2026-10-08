"use client";

import Link from "next/link";
import { useSession } from "@/lib/backend/hooks";

export function AccountLink() {
  const user = useSession();
  // Tant que la session est inconnue (rendu serveur), on réserve la place sans rien afficher.
  if (user === undefined) return <span className="inline-block w-11 sm:w-32" aria-hidden />;
  return (
    <Link
      href={user ? "/compte" : "/connexion"}
      className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-primary"
      aria-label={user ? `Mon compte (${user.firstName})` : "Se connecter"}
    >
      <span aria-hidden className="text-lg">
        👤
      </span>
      <span className="hidden sm:inline">{user ? user.firstName : "Se connecter"}</span>
    </Link>
  );
}
