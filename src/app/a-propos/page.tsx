import type { Metadata } from "next";
import { ShieldCheck, Globe, Heart, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "À propos",
  description: `Découvrez ${APP_NAME}, la marketplace de services pensée pour l'Afrique.`,
};

const values = [
  {
    icon: Globe,
    title: "Pensé pour l'Afrique",
    desc: "Modes de paiement locaux, connexion optimisée, interface en français simple.",
    color: "bg-primary-50 text-primary-600",
  },
  {
    icon: ShieldCheck,
    title: "Confiance d'abord",
    desc: "Paiement séquestre, vendeurs vérifiés, litiges gérés avec transparence.",
    color: "bg-success-50 text-success-600",
  },
  {
    icon: Heart,
    title: "Simplicité",
    desc: "Une expérience conçue pour tous, même les utilisateurs peu familiers avec la technologie.",
    color: "bg-warning-50 text-warning-600",
  },
  {
    icon: Zap,
    title: "Performance",
    desc: "Application rapide, même sur les connexions mobiles les plus lentes.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "À propos" }]} />
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          À propos de {APP_NAME}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          La marketplace de services professionnels pensée pour l&apos;Afrique.
          Simple, sécurisée, accessible.
        </p>
      </header>

      <section className="prose prose-sm prose-gray mx-auto mb-12 max-w-2xl">
        <h2>Notre mission</h2>
        <p>
          {APP_NAME} est né d&apos;un constat simple : le talent africain est immense, mais
          les outils pour le rendre accessible manquent cruellement. Trop de freelances
          talentueux peinent à trouver des clients, et trop de porteurs de projets ne
          savent pas où chercher les bons prestataires.
        </p>
        <p>
          Notre mission est de créer le pont entre l&apos;offre et la demande de services
          professionnels en Afrique, en éliminant les frictions habituelles : la confiance,
          le paiement, et la communication.
        </p>

        <h2>Pour qui ?</h2>
        <p>
          <strong>Pour les clients</strong> — entrepreneurs, PME, particuliers — qui
          cherchent des prestataires fiables pour leurs projets de design, développement,
          rédaction, marketing, vidéo, et bien plus.
        </p>
        <p>
          <strong>Pour les prestataires</strong> — freelances, agences, créatifs — qui
          veulent mettre en avant leurs compétences, recevoir des commandes et être payés
          de manière simple et sécurisée.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Nos valeurs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <Card key={v.title} className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${v.color}`}
              >
                <v.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{v.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{v.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-primary-50 p-8 text-center">
        <h2 className="text-lg font-bold text-primary-900">Rejoignez l&apos;aventure</h2>
        <p className="mt-2 text-sm text-primary-700">
          {APP_NAME} est en pleine croissance. Que vous soyez client ou prestataire,
          nous serions ravis de vous accueillir.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href="/auth/inscription"
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Créer un compte
          </a>
          <a
            href="/contact"
            className="rounded-lg border border-primary-200 bg-white px-5 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
          >
            Nous contacter
          </a>
        </div>
      </section>
    </div>
  );
}
