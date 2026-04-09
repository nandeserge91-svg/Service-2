"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/lib/contact-actions";
import { CheckCircle } from "lucide-react";

const SUBJECTS = [
  "Question générale",
  "Problème technique",
  "Litige ou réclamation",
  "Partenariat",
  "Autre",
];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await submitContactForm(formData);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
          <CheckCircle className="h-6 w-6 text-success-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Message envoyé</h3>
        <p className="mt-1 text-sm text-gray-500">
          Merci pour votre message. Nous vous répondrons dans les meilleurs délais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input name="name" label="Votre nom" placeholder="Jean Dupont" required />
        <Input name="email" label="Adresse e-mail" type="email" placeholder="jean@exemple.com" required />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Sujet</label>
        <select
          name="subject"
          required
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
          <option value="">Choisissez un sujet…</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        name="message"
        label="Votre message"
        placeholder="Décrivez votre demande en détail…"
        rows={5}
        required
      />

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Envoyer le message
      </Button>
    </form>
  );
}
