"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/backend";
import { useAsyncAction } from "@/lib/use-async-action";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { pending, run } = useAsyncAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        await run(logout);
        router.push("/");
      }}
      className={`btn bg-surface ${className}`}
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
