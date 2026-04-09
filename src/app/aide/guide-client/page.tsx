import type { Metadata } from "next";
import { Search, MessageCircle, CreditCard, CheckCircle, AlertTriangle, Star } from "lucide-react";
import { StaticPageLayout } from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
  title: "Guide client",
  description: "Tout ce que vous devez savoir pour commander un service en toute confiance.",
};

const steps = [
  {
    icon: Search,
    title: "1. Trouvez un service",
    content:
      "Utilisez la barre de recherche ou explorez les catégories pour trouver le service qui correspond à votre besoin. Comparez les vendeurs, lisez les avis et vérifiez les délais de livraison.",
  },
  {
    icon: MessageCircle,
    title: "2. Contactez le vendeur",
    content:
      "Avant de commander, n'hésitez pas à contacter le vendeur pour discuter de votre projet. Décrivez précisément vos besoins pour obtenir un résultat optimal. Vous pouvez aussi demander une offre personnalisée.",
  },
  {
    icon: CreditCard,
    title: "3. Passez commande et payez",
    content:
      "Choisissez le forfait qui vous convient, ajoutez des options si nécessaire, puis payez en toute sécurité. Votre argent est conservé en séquestre : le vendeur ne le reçoit qu'une fois que vous validez la livraison.",
  },
  {
    icon: CheckCircle,
    title: "4. Recevez et validez",
    content:
      "Le vendeur vous livre le travail dans le délai convenu. Vérifiez le résultat : si tout est bon, validez la livraison. Si des ajustements sont nécessaires, demandez une révision.",
  },
  {
    icon: AlertTriangle,
    title: "5. En cas de problème",
    content:
      "Si le vendeur ne répond pas ou si le travail ne correspond pas du tout à ce qui était convenu, ouvrez un litige depuis votre espace commande. Notre équipe de support examinera la situation et trouvera une solution équitable.",
  },
  {
    icon: Star,
    title: "6. Laissez un avis",
    content:
      "Après validation, vous pouvez noter le vendeur et laisser un commentaire. Vos avis aident la communauté à trouver les meilleurs prestataires.",
  },
];

export default function GuideClientPage() {
  return (
    <StaticPageLayout
      title="Guide client"
      subtitle="Tout ce que vous devez savoir pour commander un service en toute confiance"
      breadcrumbs={[{ label: "Aide", href: "/aide/faq" }, { label: "Guide client" }]}
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

      <div className="not-prose mt-8 rounded-xl bg-primary-50 p-6 text-center">
        <p className="text-sm font-medium text-primary-800">
          Vous avez d&apos;autres questions ?
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <a
            href="/aide/faq"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm hover:bg-primary-50"
          >
            Consulter la FAQ
          </a>
          <a
            href="/contact"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </StaticPageLayout>
  );
}
