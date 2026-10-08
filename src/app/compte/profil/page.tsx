import type { Metadata } from "next";
import { ProfilePage } from "@/components/account/profile-forms";

export const metadata: Metadata = { title: "Mon profil" };

export default function Page() {
  return <ProfilePage />;
}
