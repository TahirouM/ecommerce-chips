import type { Metadata } from "next";
import { AccountHome } from "@/components/account/account-home";

export const metadata: Metadata = { title: "Mon compte" };

export default function AccountPage() {
  return <AccountHome />;
}
