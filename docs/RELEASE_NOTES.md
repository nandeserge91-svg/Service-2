# Notes de publication

Communication utilisateur et exploitation : consigner ici chaque mise en production notable (fonctionnalités, correctifs, opérations).

## Technique — Phase 4.62 (Sentry)

- Intégration `@sentry/nextjs` : erreurs serveur, edge, client et erreur racine React (`global-error`). Tunnel `/monitoring`. Sans DSN configuré, aucun envoi.

## Technique — Phase 4.63 (e-mails différés)

- Envoi des e-mails déclenchés par `notifications.ts` et le formulaire contact **après** la réponse HTTP (`next/server` `after`), avec repli si hors contexte requête.

## Technique — Phase 4.50 (onboarding + pages manquantes + dashboards DB)

- Onboarding checklist dynamique vendeur (profil + premier service publié) et client (profil + commande + favori).
- Dashboards vendeur et client branchés sur Prisma (revenus mois, commandes actives, note moyenne, taux à temps, messages non lus, actions requises).
- 4 pages ajoutées : favoris client, paiements client, litiges client, avis vendeur — plus aucun lien sidebar en 404.

## Technique — Phase 4.49 (historique / analytics)

- Vendeur : page **Performances** (CA et commandes par jour, top services, KPIs) sur 7 / 30 / 90 jours.
- Admin : page **Analytiques** (commandes créées, inscriptions, GMV terminé, commissions par jour).
- Client : page **Historique** (dépenses par mois, dernières commandes terminées).

## Technique — Phase 4.64 (outbox PostgreSQL + i18n public)

- Table `EmailOutbox` : enqueue depuis notifications et contact ; envoi par batch après réponse + route cron sécurisée `GET /api/cron/outbox` (`CRON_SECRET`).
- Interface publique FR/EN : `next-intl`, cookie `NEXT_LOCALE`, traductions header / footer / lien d’évitement (premier périmètre).

## Documentation — Phase 5 (cadrage)

- Nouveau fichier `docs/phase-5-croissance-et-evolution.md` : roadmap post-MVP (alignement V2/V3 Phase 0, piliers, jalons 5.1–5.6 indicatifs).

## Phase 5.2 — i18n étendue (pages publiques FR/EN)

- Traductions `next-intl` étendues à **6 namespaces** : Home, About, Contact, Search, Services + shell (Header, Footer, Layout).
- Pages publiques (accueil, à propos, contact, recherche, catalogue) entièrement traduisibles via cookie `NEXT_LOCALE`.
- ICU MessageFormat pour les pluriels (`serviceCount`, `resultCount`) et les variables (`{appName}`).

## Phase 5.3 — KYC vendeur (confiance V2)

- Page `/tableau-de-bord/vendeur/kyc` : soumission document d'identité + note, affichage statut (NONE → PENDING → VERIFIED / REJECTED).
- Page `/tableau-de-bord/admin/kyc` : liste des demandes en attente + historique, validation / refus en un clic.
- Champs `kycDocumentUrl` et `kycNote` ajoutés à `SellerProfile` ; notification automatique au vendeur.
- Badge vérifié activé automatiquement à la validation KYC.

## Phase 5.4 — Système de coupons (monétisation V2)

- Modèle Prisma `Coupon` : code unique, réduction % (basis points) et/ou fixe, devise, min commande, limite d'usage, dates de validité.
- Champs `couponId` + `discountMinor` ajoutés au modèle `Order`.
- Validation coupon intégrée dans `createOrderFromPackage` : la commission est calculée après déduction du coupon.
- Page admin `/tableau-de-bord/admin/coupons` : création, activation/désactivation, suppression (si non utilisé).

## Phase 5.5 — PWA (installabilité)

- `public/manifest.json` : nom, couleurs, icônes 192/512, orientation portrait, standalone.
- Metadata Next.js : `manifest: "/manifest.json"`, `appleWebApp` pour iOS.
- Placeholder icônes `public/icons/` à fournir pour la production.

## Phase 5.6 — V3 pilotes (abonnements, parrainage, blog)

### Abonnements vendeur
- Modèle `SellerSubscription` : plans FREE / PRO / PREMIUM avec statuts ACTIVE / CANCELLED / EXPIRED.
- Page vendeur `/tableau-de-bord/vendeur/abonnement` : comparaison des plans, souscription, annulation.
- Plans avec features différenciées (services illimités, badge Pro, priorité recherche, commission réduite).

### Parrainage
- Modèle `Referral` : liaison parrain → filleul, code unique par utilisateur, crédit bonus.
- Champ `referralCode` ajouté au modèle `User` (unique, généré automatiquement).
- Page client `/tableau-de-bord/client/parrainage` : code, lien de partage, stats, historique.
- Bonus crédité automatiquement à la première commande du filleul.

### Blog / CMS
- Modèle `BlogPost` : slug, titre, résumé, body Markdown, tags, couverture, publication.
- Page admin `/tableau-de-bord/admin/blog` : création, publication/dépublication, suppression.
- Pages publiques `/blog` (listing) et `/blog/[slug]` (détail) avec SEO `generateMetadata`.

## Phase 6.1 — Push notifications (PWA)

- Modèle Prisma `PushSubscription` : endpoint, clés VAPID p256dh/auth, lié à l'utilisateur.
- Service worker `public/sw.js` : réception push, affichage notification native, clic → navigation.
- API route `POST/DELETE /api/push/subscribe` : souscription et désinscription push côté serveur.
- Composant `PushManager` dans le header : toggle push actif/inactif (visible uniquement si supporté).
- Module `src/lib/push.ts` : envoi push via `web-push` VAPID, nettoyage des souscriptions expirées (410/404).
- Intégration dans `notifications.ts` : chaque `notify()` envoie aussi un push natif en plus de in_app + email.
- `ServiceWorkerRegister` : enregistrement automatique du SW au chargement du layout.
- Variables d'environnement : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_MAILTO`.

## v0.1.0 — Gel première mise en production

**Date cible :** à renseigner au go-live.

**Contenu fonctionnel (rappel) :**

- Marketplace services : catalogue, recherche, fiches détaillées, messagerie, offres, commandes.
- Paiements Chariow (intégration selon configuration), portefeuille vendeur, séquestre / ledger.
- Notifications, avis et réputation, litiges et espace admin.
- Authentification (client / vendeur / admin), conformité et durcissement (rate limit, CSP, documentation RGPD).

**Gel de version (exploitation) :**

- Étiqueter le dépôt : `git tag -a v0.1.0 -m "Première mise en production"` puis pousser les tags.
- Figurer la même référence sur l’image Docker / le manifeste de déploiement (voir `docs/deploiement.md`).
- Optionnel : définir `NEXT_PUBLIC_APP_RELEASE_LABEL=v0.1.0` en production pour affichage sur la page statut / notes.

**Après le gel :**

- Les évolutions suivantes passent en **v0.2.x** ou **v1.1.0** selon votre politique semver ; mettre à jour ce fichier et la version dans `package.json` lors des prochaines releases.
