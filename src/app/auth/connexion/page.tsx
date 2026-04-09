"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/tableau-de-bord";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <Card padding="lg">
      <h1 className="mb-1 text-xl font-bold text-gray-900">Connexion</h1>
      <p className="mb-6 text-sm text-gray-500">
        Accédez à votre compte pour gérer vos commandes et services.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          icon={<LogIn className="h-4 w-4" />}
        >
          Se connecter
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-gray-500">
          Pas encore de compte ?{" "}
          <Link href="/auth/inscription" className="font-medium text-primary-600 hover:text-primary-700">
            Créer un compte client
          </Link>
        </p>
        <p className="text-gray-500">
          Vous proposez des services ?{" "}
          <Link href="/auth/inscription/vendeur" className="font-medium text-primary-600 hover:text-primary-700">
            Devenir vendeur
          </Link>
        </p>
      </div>
    </Card>
  );
}
