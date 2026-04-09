# Notes de publication

Communication utilisateur et exploitation : consigner ici chaque mise en production notable (fonctionnalités, correctifs, opérations).

## Technique — Phase 4.62 (Sentry)

- Intégration `@sentry/nextjs` : erreurs serveur, edge, client et erreur racine React (`global-error`). Tunnel `/monitoring`. Sans DSN configuré, aucun envoi.

## Technique — Phase 4.63 (e-mails différés)

- Envoi des e-mails déclenchés par `notifications.ts` et le formulaire contact **après** la réponse HTTP (`next/server` `after`), avec repli si hors contexte requête.

## Technique — Phase 4.64 (outbox PostgreSQL + i18n public)

- Table `EmailOutbox` : enqueue depuis notifications et contact ; envoi par batch après réponse + route cron sécurisée `GET /api/cron/outbox` (`CRON_SECRET`).
- Interface publique FR/EN : `next-intl`, cookie `NEXT_LOCALE`, traductions header / footer / lien d’évitement (premier périmètre).

## Documentation — Phase 5 (cadrage)

- Nouveau fichier `docs/phase-5-croissance-et-evolution.md` : roadmap post-MVP (alignement V2/V3 Phase 0, piliers, jalons 5.1–5.6 indicatifs).

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
