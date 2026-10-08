import type { Metadata } from "next";
import { AuthLayout } from "@/components/account/auth-layout";
import { ForgotPassword } from "@/components/account/forgot-password";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      emoji="🔑"
      title="Mot de passe oublié"
      intro="Indiquez votre e-mail : nous vous envoyons un lien pour en choisir un nouveau."
    >
      <ForgotPassword />
    </AuthLayout>
  );
}
