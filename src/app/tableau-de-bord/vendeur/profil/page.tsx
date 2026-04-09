"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { updateSellerProfile } from "@/lib/profile-actions";

export default function SellerProfilPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    city: "",
    phone: "",
    languages: "",
  });

  useEffect(() => {
    fetch("/api/profile/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.sellerProfile) {
          setProfile({
            displayName: d.sellerProfile.displayName ?? "",
            bio: d.sellerProfile.bio ?? "",
            city: d.sellerProfile.city ?? "",
            phone: d.sellerProfile.phone ?? "",
            languages: (d.sellerProfile.languages ?? []).join(", "),
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await updateSellerProfile(form);

    setLoading(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profil vendeur</h1>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700">
          <CheckCircle className="h-4 w-4" /> Profil mis à jour.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardTitle className="mb-4">Identité professionnelle</CardTitle>
          <div className="space-y-4">
            <Input
              label="Email"
              value={session?.user?.email ?? ""}
              disabled
            />
            <Input
              name="displayName"
              label="Nom professionnel"
              placeholder="Studio Koffi Design"
              defaultValue={profile.displayName}
              required
            />
            <Textarea
              name="bio"
              label="Bio / Description"
              placeholder="Décrivez votre expertise, vos compétences et votre expérience…"
              defaultValue={profile.bio}
              hint="Aide les clients à décider de travailler avec vous."
            />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-4">Coordonnées</CardTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="city"
              label="Ville"
              placeholder="Dakar"
              defaultValue={profile.city}
            />
            <Input
              name="phone"
              type="tel"
              label="Téléphone"
              placeholder="+221 77 123 4567"
              defaultValue={profile.phone}
            />
            <Input
              name="languages"
              label="Langues (séparées par des virgules)"
              placeholder="Français, Anglais, Wolof"
              defaultValue={profile.languages}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            icon={<Save className="h-4 w-4" />}
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
