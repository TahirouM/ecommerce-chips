"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import type { PublicUser } from "@/lib/backend";
import { LogoutButton } from "./logout-button";
import { RequireAuth } from "./require-auth";

const UserContext = createContext<PublicUser | null>(null);

/** Utilisateur connecté, garanti non nul sous `AccountShell`. */
export function useUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser doit être utilisé sous <AccountShell>");
  return user;
}

const LINKS = [
  { href: "/compte", label: "Tableau de bord", emoji: "🏠" },
  { href: "/compte/commandes", label: "Mes commandes", emoji: "📦" },
  { href: "/compte/adresses", label: "Mes adresses", emoji: "📍" },
  { href: "/favoris", label: "Mes favoris", emoji: "💛" },
  { href: "/compte/profil", label: "Mon profil", emoji: "👤" },
];

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <RequireAuth>
      {(user) => (
        <UserContext.Provider value={user}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] print:block">
            <nav aria-label="Espace client" className="h-fit min-w-0 print:hidden">
              <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {LINKS.map((l) => (
                  <li key={l.href} className="shrink-0">
                    <Link
                      href={l.href}
                      aria-current={
                        pathname === l.href || (l.href !== "/compte" && pathname.startsWith(l.href))
                          ? "page"
                          : undefined
                      }
                      className="flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold whitespace-nowrap hover:border-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-primary aria-[current=page]:shadow-pop-sm"
                    >
                      <span aria-hidden>{l.emoji}</span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <LogoutButton className="mt-6 hidden w-full lg:flex" />
            </nav>
            <div className="min-w-0">{children}</div>
          </div>
        </UserContext.Provider>
      )}
    </RequireAuth>
  );
}
