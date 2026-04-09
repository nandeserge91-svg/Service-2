import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/static-page-layout";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
};

export default function CGUPage() {
  return (
    <StaticPageLayout
      title="Conditions Générales d'Utilisation"
      subtitle={`Dernière mise à jour : 1er avril 2026`}
      breadcrumbs={[{ label: "Conditions d'utilisation" }]}
    >
      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent
        l&apos;accès et l&apos;utilisation de la plateforme <strong>{APP_NAME}</strong>,
        marketplace de services en ligne mettant en relation des prestataires (« Vendeurs »)
        et des clients (« Acheteurs ») principalement en Afrique.
      </p>
      <p>
        En utilisant la plateforme, vous acceptez sans réserve les présentes CGU. Si vous
        n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
      </p>

      <h2>2. Inscription et compte utilisateur</h2>
      <p>
        L&apos;inscription est gratuite et ouverte à toute personne physique ou morale ayant
        la capacité juridique. Vous vous engagez à fournir des informations exactes et à
        maintenir votre compte à jour.
      </p>
      <ul>
        <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
        <li>Un seul compte par personne est autorisé.</li>
        <li>Nous nous réservons le droit de suspendre tout compte en cas de violation des CGU.</li>
      </ul>

      <h2>3. Services proposés</h2>
      <p>
        {APP_NAME} fournit un espace permettant aux Vendeurs de publier des services et aux
        Acheteurs de les commander. La plateforme agit en tant qu&apos;intermédiaire et n&apos;est
        pas partie prenante aux contrats conclus entre Vendeurs et Acheteurs.
      </p>

      <h2>4. Commandes et paiements</h2>
      <p>
        Toute commande constitue un engagement ferme de l&apos;Acheteur. Le paiement est
        effectué au moment de la commande et placé en séquestre (escrow) jusqu&apos;à
        validation de la livraison.
      </p>
      <ul>
        <li>Les fonds ne sont libérés au Vendeur qu&apos;après validation par l&apos;Acheteur.</li>
        <li>Une commission est prélevée par la plateforme sur chaque transaction.</li>
        <li>Les prix sont exprimés dans la devise indiquée sur chaque service.</li>
      </ul>

      <h2>5. Livraison et validation</h2>
      <p>
        Le Vendeur s&apos;engage à livrer le travail dans le délai convenu. L&apos;Acheteur
        dispose d&apos;un délai raisonnable pour valider ou demander une révision. Passé ce
        délai, la commande est automatiquement marquée comme terminée.
      </p>

      <h2>6. Litiges et médiation</h2>
      <p>
        En cas de différend, les parties sont invitées à privilégier le dialogue via la
        messagerie de la plateforme. Si aucun accord n&apos;est trouvé, un litige peut être
        ouvert et sera traité par notre équipe de support.
      </p>
      <p>
        La résolution peut aboutir à un remboursement total ou partiel de l&apos;Acheteur,
        ou à la libération des fonds au Vendeur, selon les circonstances.
      </p>

      <h2>7. Propriété intellectuelle</h2>
      <p>
        Le Vendeur garantit disposer des droits nécessaires sur les livrables. Sauf mention
        contraire, les droits de propriété intellectuelle sont transférés à l&apos;Acheteur
        une fois la commande terminée et le paiement libéré.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        {APP_NAME} met tout en œuvre pour assurer la disponibilité et la sécurité de la
        plateforme, mais ne saurait être tenu responsable des interruptions, erreurs ou
        de la qualité des services fournis par les Vendeurs.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Le traitement de vos données personnelles est détaillé dans notre{" "}
        <a href="/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>10. Modification des CGU</h2>
      <p>
        Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les
        utilisateurs seront informés des changements significatifs. La poursuite de
        l&apos;utilisation après modification vaut acceptation.
      </p>

      <h2>11. Contact</h2>
      <p>
        Pour toute question relative aux présentes CGU, vous pouvez nous{" "}
        <a href="/contact">contacter</a>.
      </p>
    </StaticPageLayout>
  );
}
