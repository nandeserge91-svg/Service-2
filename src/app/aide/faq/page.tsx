import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/static-page-layout";
import { FaqAccordion } from "@/components/help/faq-accordion";

export const metadata: Metadata = {
  title: "Foire Aux Questions",
  description: "Réponses aux questions les plus fréquentes sur la plateforme.",
};

const faqSections = [
  {
    title: "Général",
    items: [
      {
        q: "Qu'est-ce que cette plateforme ?",
        a: "C'est une marketplace de services qui met en relation des prestataires professionnels et des clients, principalement en Afrique. Vous pouvez y trouver des services de design, développement, rédaction, marketing, et bien plus.",
      },
      {
        q: "L'inscription est-elle gratuite ?",
        a: "Oui, l'inscription est entièrement gratuite pour les clients comme pour les vendeurs. Aucun frais d'inscription ou d'abonnement.",
      },
      {
        q: "Dans quels pays la plateforme est-elle disponible ?",
        a: "La plateforme est accessible partout dans le monde, mais elle est spécialement conçue pour l'Afrique francophone avec des moyens de paiement adaptés.",
      },
    ],
  },
  {
    title: "Pour les clients",
    items: [
      {
        q: "Comment passer une commande ?",
        a: "Trouvez un service qui vous intéresse, choisissez un forfait, puis cliquez sur « Commander ». Vous pouvez aussi contacter le vendeur avant pour discuter de votre projet.",
      },
      {
        q: "Mon paiement est-il sécurisé ?",
        a: "Absolument. Votre paiement est placé en séquestre (escrow) : le vendeur ne reçoit l'argent que lorsque vous validez la livraison. En cas de problème, vous pouvez ouvrir un litige.",
      },
      {
        q: "Que faire si je ne suis pas satisfait ?",
        a: "Vous pouvez d'abord demander une révision au vendeur. Si le problème persiste, ouvrez un litige depuis votre espace commande. Notre équipe de support examinera la situation et prendra une décision équitable.",
      },
      {
        q: "Puis-je annuler une commande ?",
        a: "Vous pouvez annuler une commande tant que le vendeur n'a pas encore commencé le travail. Une fois le travail en cours, vous pouvez demander une révision ou ouvrir un litige.",
      },
    ],
  },
  {
    title: "Pour les vendeurs",
    items: [
      {
        q: "Comment devenir vendeur ?",
        a: "Créez un compte vendeur depuis la page d'inscription vendeur. Complétez votre profil, puis publiez votre premier service. C'est gratuit.",
      },
      {
        q: "Quelle commission est prélevée ?",
        a: "Une commission est prélevée sur chaque commande terminée. Le taux exact dépend de la catégorie de service. Vous verrez toujours le montant net avant d'accepter une commande.",
      },
      {
        q: "Comment suis-je payé ?",
        a: "Une fois une commande terminée et validée, les fonds sont crédités dans votre portefeuille. Vous pouvez ensuite faire une demande de retrait vers votre moyen de paiement préféré.",
      },
      {
        q: "Quand puis-je retirer mes fonds ?",
        a: "Vous pouvez demander un retrait dès que votre solde disponible est suffisant. Les retraits sont traités par notre équipe, généralement sous 1 à 3 jours ouvrés.",
      },
    ],
  },
  {
    title: "Paiements et litiges",
    items: [
      {
        q: "Quels moyens de paiement sont acceptés ?",
        a: "Nous acceptons les paiements via mobile money (Orange Money, MTN Money, Wave) et les cartes bancaires, via notre partenaire de paiement sécurisé.",
      },
      {
        q: "Comment fonctionne le système de séquestre ?",
        a: "Quand un client paie, l'argent est conservé en sécurité par la plateforme. Il n'est transféré au vendeur que lorsque le client valide la livraison ou après expiration du délai de validation.",
      },
      {
        q: "Comment ouvrir un litige ?",
        a: "Depuis la page de votre commande, cliquez sur « Ouvrir un litige » et décrivez le problème. Notre équipe prendra en charge votre demande et contactera les deux parties.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <StaticPageLayout
      title="Foire Aux Questions"
      subtitle="Trouvez rapidement des réponses à vos questions"
      breadcrumbs={[{ label: "Aide", href: "/aide/faq" }, { label: "FAQ" }]}
    >
      <div className="not-prose space-y-8">
        {faqSections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <FaqAccordion key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  );
}
