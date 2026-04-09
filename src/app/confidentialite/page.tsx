import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/static-page-layout";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="Politique de confidentialité"
      subtitle={`Dernière mise à jour : 1er avril 2026`}
      breadcrumbs={[{ label: "Confidentialité" }]}
    >
      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est la société éditrice de la plateforme{" "}
        <strong>{APP_NAME}</strong>. Pour toute question, vous pouvez nous{" "}
        <a href="/contact">contacter</a>.
      </p>

      <h2>2. Données collectées</h2>
      <p>Nous collectons les données suivantes :</p>
      <ul>
        <li>
          <strong>Données d&apos;inscription</strong> : nom, adresse e-mail, mot de passe
          (chiffré), numéro de téléphone (optionnel).
        </li>
        <li>
          <strong>Données de profil vendeur</strong> : nom d&apos;affichage, ville, pays,
          biographie, photo de profil.
        </li>
        <li>
          <strong>Données transactionnelles</strong> : commandes, paiements, montants,
          historique de facturation.
        </li>
        <li>
          <strong>Données de communication</strong> : messages échangés sur la plateforme.
        </li>
        <li>
          <strong>Données techniques</strong> : adresse IP, type de navigateur, pages
          consultées, durée des visites.
        </li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>Vos données sont utilisées pour :</p>
      <ul>
        <li>Créer et gérer votre compte utilisateur.</li>
        <li>Faciliter les transactions entre Acheteurs et Vendeurs.</li>
        <li>Assurer la sécurité et prévenir la fraude.</li>
        <li>Envoyer des notifications liées à vos commandes.</li>
        <li>Améliorer nos services et personnaliser votre expérience.</li>
        <li>Respecter nos obligations légales.</li>
      </ul>

      <h2>4. Partage des données</h2>
      <p>
        Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
      </p>
      <ul>
        <li>Les prestataires de paiement (pour le traitement des transactions).</li>
        <li>Les autorités compétentes (en cas d&apos;obligation légale).</li>
        <li>
          L&apos;autre partie dans une transaction (nom d&apos;affichage, pour la bonne
          exécution de la commande).
        </li>
        <li>
          Nos sous-traitants techniques (hébergement de l&apos;application et de la base de
          données, envoi d&apos;e-mails, prestataire de paiement), sous contrat et uniquement
          sur nos instructions, dans le respect du RGPD.
        </li>
      </ul>

      <h2>5. Conservation des données</h2>
      <p>
        Les durées ci-dessous sont indicatives ; la société éditrice peut les adapter pour
        respecter la loi applicable (dont obligations comptables et fiscales).
      </p>
      <ul>
        <li>
          <strong>Compte et profil</strong> : pendant la vie du compte, puis jusqu&apos;à
          3 ans après suppression ou dernière activité, sauf obligation légale plus longue.
        </li>
        <li>
          <strong>Commandes, facturation, paiements</strong> : durée nécessaire au service
          et aux obligations légales (souvent 6 à 10 ans selon les pays).
        </li>
        <li>
          <strong>Messages et litiges</strong> : durée du traitement du dossier puis
          archivage limité en cas d&apos;obligation légale.
        </li>
        <li>
          <strong>Journaux techniques et de sécurité</strong> (ex. accès serveur, tentatives
          de connexion) : typiquement 30 à 90 jours, sauf enquête de sécurité.
        </li>
        <li>
          <strong>Journal d&apos;audit métier</strong> (actions sensibles sur la plateforme) :
          conservation prolongée pour prévention de la fraude et preuve en cas de litige,
          dans la limite du cadre légal.
        </li>
      </ul>

      <h2>6. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
        protéger vos données : chiffrement des mots de passe (bcrypt), connexions HTTPS,
        contrôle d&apos;accès strict aux bases de données.
      </p>

      <h2>7. Vos droits (RGPD / données personnelles)</h2>
      <p>
        Si vous êtes situé dans l&apos;Espace économique européen ou soumis au RGPD, vous
        disposez notamment des droits suivants :
      </p>
      <ul>
        <li>Droit d&apos;accès à vos données personnelles.</li>
        <li>Droit de rectification des données inexactes.</li>
        <li>Droit à l&apos;effacement (« droit à l&apos;oubli »), sous réserves légales.</li>
        <li>Droit à la portabilité de vos données (lorsque le traitement est automatisé).</li>
        <li>Droit d&apos;opposition ou de limitation du traitement, selon les cas.</li>
        <li>
          Droit de retirer votre consentement lorsque le traitement est fondé sur le
          consentement.
        </li>
      </ul>
      <p>
        Pour exercer ces droits, <a href="/contact">contactez-nous</a> en précisant votre
        demande. Nous nous efforçons d&apos;y répondre dans un délai d&apos;un mois.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de l&apos;autorité de
        protection des données de votre pays. En France : la{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          CNIL
        </a>
        .
      </p>

      <h2>8. Cookies</h2>
      <p>
        La plateforme utilise des cookies essentiels au fonctionnement (session
        d&apos;authentification). Aucun cookie publicitaire n&apos;est utilisé.
      </p>

      <h2>9. Modifications</h2>
      <p>
        Cette politique peut être mise à jour. Les changements significatifs vous seront
        communiqués par notification.
      </p>
    </StaticPageLayout>
  );
}
