"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { registerClient } from "@/lib/auth-actions";

export default function InscriptionClientPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    if (form.get("password") !== form.get("confirmPassword")) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const result = await registerClient(form);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      router.push("/auth/connexion");
    } else {
      router.push("/tableau-de-bord/client");
      router.refresh();
    }
  }

  return (
    <Card padding="lg">
      <h1 className="mb-1 text-xl font-bold text-gray-900">Créer un compte</h1>
      <p className="mb-6 text-sm text-gray-500">
        Inscrivez-vous pour trouver et commander des services.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          label="Votre nom"
          placeholder="Ex : Aminata Diallo"
          required
        />
        <Input
          name="email"
          type="email"
          label="Adresse email"
          placeholder="votre@email.com"
          required
          autoComplete="email"
        />
        <Input
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="8 caractères minimum"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          name="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          icon={<UserPlus className="h-4 w-4" />}
        >
          Créer mon compte
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-gray-500">
          Déjà inscrit ?{" "}
          <Link href="/auth/connexion" className="font-medium text-primary-600 hover:text-primary-700">
            Se connecter
          </Link>
        </p>
        <p className="text-gray-500">
          Vous proposez des services ?{" "}
          <Link href="/auth/inscription/vendeur" className="font-medium text-primary-600 hover:text-primary-700">
            Inscription vendeur
          </Link>
        </p>
      </div>
    </Card>
  );
}
