import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout, FormSkeleton } from "@/components/account/auth-layout";
import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <AuthLayout
      emoji="👋"
      title="Content de vous revoir"
      intro="Connectez-vous pour suivre vos commandes et commander plus vite."
    >
      {/* Le formulaire lit ?retour= : rendu côté client, sous Suspense. */}
      <Suspense fallback={<FormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
