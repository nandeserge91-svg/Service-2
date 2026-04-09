"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { registerSeller } from "@/lib/auth-actions";

const africanCountries = [
  { code: "SN", label: "Sénégal" },
  { code: "CI", label: "Côte d'Ivoire" },
  { code: "CM", label: "Cameroun" },
  { code: "ML", label: "Mali" },
  { code: "BF", label: "Burkina Faso" },
  { code: "GN", label: "Guinée" },
  { code: "BJ", label: "Bénin" },
  { code: "TG", label: "Togo" },
  { code: "NE", label: "Niger" },
  { code: "TD", label: "Tchad" },
  { code: "GA", label: "Gabon" },
  { code: "CG", label: "Congo" },
  { code: "CD", label: "RD Congo" },
  { code: "MG", label: "Madagascar" },
  { code: "MA", label: "Maroc" },
  { code: "TN", label: "Tunisie" },
  { code: "DZ", label: "Algérie" },
  { code: "NG", label: "Nigeria" },
  { code: "GH", label: "Ghana" },
  { code: "KE", label: "Kenya" },
  { code: "RW", label: "Rwanda" },
];

export default function InscriptionVendeurPage() {
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

    const result = await registerSeller(form);

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
      router.push("/tableau-de-bord/vendeur");
      router.refresh();
    }
  }

  return (
    <Card padding="lg">
      <h1 className="mb-1 text-xl font-bold text-gray-900">Devenir vendeur</h1>
      <p className="mb-6 text-sm text-gray-500">
        Créez votre profil professionnel et commencez à proposer vos services.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="displayName"
          label="Nom professionnel"
          placeholder="Ex : Studio Koffi Design"
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="countryCode" className="text-sm font-medium text-gray-700">
            Pays
          </label>
          <select
            id="countryCode"
            name="countryCode"
            required
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="">Sélectionnez votre pays</option>
            {africanCountries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

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
          icon={<Store className="h-4 w-4" />}
        >
          Créer mon profil vendeur
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
          Vous cherchez un service ?{" "}
          <Link href="/auth/inscription" className="font-medium text-primary-600 hover:text-primary-700">
            Inscription client
          </Link>
        </p>
      </div>
    </Card>
  );
}
