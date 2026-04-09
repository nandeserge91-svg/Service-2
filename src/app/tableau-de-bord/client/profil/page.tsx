"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { updateClientProfile } from "@/lib/profile-actions";

export default function ClientProfilPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<{
    displayName: string;
    phone: string;
  }>({ displayName: "", phone: "" });

  useEffect(() => {
    fetch("/api/profile/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.buyerProfile) {
          setProfile({
            displayName: d.buyerProfile.displayName ?? "",
            phone: d.buyerProfile.phone ?? "",
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
    const result = await updateClientProfile(form);

    setLoading(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

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
          <CardTitle className="mb-4">Informations personnelles</CardTitle>
          <div className="space-y-4">
            <Input
              label="Email"
              value={session?.user?.email ?? ""}
              disabled
              hint="L'email ne peut pas être modifié."
            />
            <Input
              name="displayName"
              label="Nom affiché"
              placeholder="Votre nom"
              defaultValue={profile.displayName}
              required
            />
            <Input
              name="phone"
              type="tel"
              label="Téléphone"
              placeholder="+221 77 123 4567"
              defaultValue={profile.phone}
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
