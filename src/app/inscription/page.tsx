import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout, FormSkeleton } from "@/components/account/auth-layout";
import { RegisterForm } from "@/components/account/register-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <AuthLayout
      emoji="🥔"
      title="Rejoindre le club"
      intro="Un compte pour retrouver vos adresses, vos favoris et suivre vos commandes."
    >
      <Suspense fallback={<FormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
