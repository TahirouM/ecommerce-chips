"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/backend/hooks";
import { LogoutButton } from "./logout-button";
import { PageTitle } from "./page-title";
import { useUser } from "./account-shell";

export function AccountHome() {
  const user = useUser();
  const favorites = useFavorites();
  const defaultAddress = user.addresses.find((a) => a.isDefault);

  const tiles = [
    {
      href: "/compte/adresses",
      emoji: "📍",
      title: "Mes adresses",
      text: defaultAddress
        ? `Par défaut : ${defaultAddress.line1}, ${defaultAddress.zip} ${defaultAddress.city}`
        : "Aucune adresse enregistrée.",
      color: "bg-blue/15",
    },
    {
      href: "/favoris",
      emoji: "💛",
      title: "Mes favoris",
      text: `${favorites.length} saveur${favorites.length > 1 ? "s" : ""} mise${favorites.length > 1 ? "s" : ""} de côté.`,
      color: "bg-primary/25",
    },
    {
      href: "/compte/profil",
      emoji: "👤",
      title: "Mon profil",
      text: `${user.firstName} ${user.lastName} · ${user.email}`,
      color: "bg-accent/15",
    },
  ];

  return (
    <>
      <PageTitle
        intro={`Client depuis ${new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}.`}
      >
        Bonjour {user.firstName} 👋
      </PageTitle>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-2xl border-2 border-foreground p-5 shadow-pop transition hover:-translate-y-1 hover:shadow-pop-lg ${t.color}`}
          >
            <span className="text-3xl" aria-hidden>
              {t.emoji}
            </span>
            <p className="mt-3 font-display text-xl font-extrabold">{t.title}</p>
            <p className="mt-1 text-sm text-muted">{t.text}</p>
          </Link>
        ))}
      </div>
      <LogoutButton className="mt-10 lg:hidden" />
    </>
  );
}
