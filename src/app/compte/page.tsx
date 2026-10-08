import type { Metadata } from "next";
import { AccountHome } from "@/components/account/account-home";

export const metadata: Metadata = { title: "Mon compte" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <AccountHome />
    </div>
  );
}
