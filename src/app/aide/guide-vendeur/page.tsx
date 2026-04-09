import type { Metadata } from "next";
import { UserPlus, Store, ShoppingBag, MessageCircle, Wallet, Star } from "lucide-react";
import { StaticPageLayout } from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
  title: "Guide vendeur",
  description: "Créez votre profil, publiez vos services et commencez à recevoir des commandes.",
};

const steps = [
  {
    icon: UserPlus,
    title: "1. Créez votre compte vendeur",
    content:
      "Inscrivez-vous en tant que vendeur. Complétez votre profil avec soin : photo, biographie, compétences, ville et pays. Un profil complet inspire confiance et attire plus de clients.",
  },
  {
    icon: Store,
    title: "2. Publiez votre premier service",
    content:
      "Décrivez clairement ce que vous proposez. Ajoutez un titre accrocheur, une description détaillée, et au moins un forfait avec prix, délai et nombre de révisions. Des FAQ aident aussi vos clients potentiels.",
  },
  {
    icon: ShoppingBag,
    title: "3. Recevez des commandes",
    content:
      "Quand un client commande votre service, vous êtes notifié par e-mail et dans votre tableau de bord. Consultez les détails de la commande et le brief du client, puis commencez à travailler.",
  },
  {
    icon: MessageCircle,
    title: "4. Communiquez avec vos clients",
    content:
      "Maintenez une bonne communication. Répondez rapidement aux messages, demandez des précisions si nécessaire, et tenez le client informé de l'avancement. Les vendeurs réactifs sont mieux notés.",
  },
  {
    icon: Wallet,
    title: "5. Soyez payé",
    content:
      "Une fois la livraison validée par le client, les fonds sont crédités dans votre portefeuille (moins la commission plateforme). Demandez un retrait quand vous le souhaitez via mobile money ou virement.",
  },
  {
    icon: Star,
    title: "6. Construisez votre réputation",
    content:
      "Chaque commande réussie renforce votre profil. Les bons avis attirent de nouveaux clients. Répondez toujours aux avis pour montrer votre professionnalisme.",
  },
];

const tips = [
  "Utilisez des titres de service clairs et précis, avec les mots-clés que vos clients rechercheraient.",
  "Proposez plusieurs forfaits (Basique, Standard, Premium) pour toucher différents budgets.",
  "Répondez aux messages en moins de 24h. Le temps de réponse est visible sur votre profil.",
  "Livrez toujours à temps ou en avance. Les retards affectent votre réputation.",
  "Demandez poliment un avis après chaque commande terminée.",
];

export default function GuideVendeurPage() {
  return (
    <StaticPageLayout
      title="Guide vendeur"
      subtitle="Créez votre profil, publiez vos services et développez votre activité"
      breadcrumbs={[{ label: "Aide", href: "/aide/faq" }, { label: "Guide vendeur" }]}
    >
      <div className="not-prose space-y-6">
        {steps.map((step) => (
          <div key={step.title} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{step.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="not-prose mt-8 rounded-xl border border-warning-200 bg-warning-50 p-6">
        <h3 className="font-semibold text-warning-800">Conseils pour réussir</h3>
        <ul className="mt-3 space-y-2">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-warning-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="not-prose mt-8 rounded-xl bg-primary-50 p-6 text-center">
        <p className="text-sm font-medium text-primary-800">Prêt à commencer ?</p>
        <a
          href="/auth/inscription/vendeur"
          className="mt-3 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Créer mon compte vendeur
        </a>
      </div>
    </StaticPageLayout>
  );
}
