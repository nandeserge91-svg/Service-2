import type { Metadata } from "next";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/components/help/contact-form";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Nous contacter",
  description: `Contactez l'équipe ${APP_NAME}. Nous sommes là pour vous aider.`,
};

const channels = [
  {
    icon: Mail,
    title: "E-mail",
    desc: "Envoyez-nous un message via le formulaire ci-dessous ou à support@marketplace.com.",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: MessageCircle,
    title: "Messagerie",
    desc: "Si vous avez un compte, utilisez la messagerie intégrée pour un suivi plus rapide.",
    color: "bg-success-50 text-success-600",
  },
  {
    icon: Clock,
    title: "Délai de réponse",
    desc: "Nous répondons généralement sous 24 à 48 heures ouvrées.",
    color: "bg-warning-50 text-warning-600",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Nous contacter" }]} />
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Nous contacter</h1>
        <p className="mt-2 text-gray-500">
          Une question, un problème, une suggestion ? Notre équipe est à votre écoute.
        </p>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {channels.map((ch) => (
          <Card key={ch.title} className="flex flex-col items-center text-center">
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${ch.color}`}
            >
              <ch.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{ch.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{ch.desc}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-5 text-lg font-semibold text-gray-900">Envoyez-nous un message</h2>
        <ContactForm />
      </Card>
    </div>
  );
}
