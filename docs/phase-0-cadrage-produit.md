# Phase 0 — Cadrage produit

## 1. Analyse du besoin et reformulation professionnelle

**Besoin exprimé :** une marketplace de services **mobile-first**, **francophone prioritaire**, inspirée de Fiverr/ComeUp mais **simplifiée**, **rassurante** sur l’argent et les statuts, avec **messagerie**, **commandes**, **devis**, **paiements multiples** (acompte, total, différé selon règles), **escrow**, **wallet**, **litiges**, **KYC configurable**, **modération**, **analytics** et **tutoriels**.

**Reformulation :** plateforme SaaS B2C/B2B légère de **mise en relation et d’exécution de prestations** (numériques ou hybrides), où la **plateforme tient la vérité métier** (commande, livraison, validation, litige) et une **couche financière interne** (ledger + escrow logique) s’aligne sur un **PSP / Chariow** pour l’encaissement, sans supposer qu’un produit « Service » Chariow API couvre le parcours marketplace.

## 2. Benchmark conceptuel et différenciation

| Critère | Fiverr / ComeUp (réf.) | Proposition « Afrique-ready » |
|--------|-------------------------|-------------------------------|
| Complexité perçue | Nombreux écrans, jargon | Parcours **guidés**, vocabulaire **français simple**, statuts **expliqués** |
| Confiance | Réputation globale marque | **Badges locaux**, **vérifications** explicites, **timeline** commande, **escrow visible** |
| Mobile | Adapté mais desktop-first | **Mobile-first**, PWA, pièces jointes légères, reprise après coupure |
| Paiement | Carte + historique | **Même clarté** + préparation **multi-devises** et **moyens locaux** (roadmap) |
| Support | Standard | **Centre d’aide** + **litige** très lisible + SLA affiché (V2+) |

## 3. Spécifications fonctionnelles détaillées (périmètre cible)

Voir liste exhaustive section « Inventaire fonctionnel » du livrable principal (message Phase 0) ; ce document résume les **domaines** :

- **Identité & accès** : comptes, rôles, vérifications email/téléphone, KYC vendeur optionnel.
- **Catalogue** : catégories, services, packages, extras, FAQ, portfolio, disponibilité, zones, langues.
- **Relationnel** : inbox, fichiers, offres/devis, transformation conversation → commande.
- **Transaction** : commande, jalons, livraison, révisions, annulation, expiration.
- **Paiement & trésorerie** : intents, capture via PSP, escrow, commission, retrait, historique, factures/reçus.
- **Confiance** : avis vérifiés, signalements, anti-fraude basique → avancée.
- **Opérations** : support, modération, admin, audit, reporting.

## 4. MVP vs V2 vs V3

### MVP (lancement contrôlé)

- Auth, profils client/vendeur, catalogue + recherche/filtres basiques.
- Messagerie + pièces jointes (taille limitée) + offre personnalisée.
- Commande + timeline + livraison + validation / demande révision.
- **Un** parcours de paiement clair (ex. paiement intégral ou acompte + solde — à paramétrer globalement).
- Ledger + escrow **interne** + webhooks PSP ; commission plateforme fixe ou par catégorie simple.
- Notifications email + in-app (temps quasi réel option SSE/WebSocket).
- Avis post-commande, litige **simple** (workflow limité), admin minimal (utilisateurs, commandes, litiges).
- Contenu aide : FAQ + checklists + tooltips.

### V2

- KYC vendeur, règles paiement différé avancées, coupons, parrainage.
- Modération riche, anti-fraude/score confiance, relances automatiques.
- Centre notifications unifié, recommandations, comparaison services.
- Retraits vendeurs opérationnels de bout en bout + rapprochement comptable export.
- i18n EN + second pays.

### V3

- Abonnements vendeur premium, boost visibilité, blog/CMS, SLA support intégré.
- Intégrations paiement locales additionnelles, multi-devises opérationnelles.
- Chatbot assistance, tutoriels interactifs poussés, détection conversations à risque ML.

## 5. Personas

1. **Aminata ( cliente, 28 ans, mobile )** — cherche logo pour TPE ; peu de temps ; veut **prix tout compris** et **preuve de paiement sécurisé**.
2. **Koffi ( vendeur créatif, 32 ans )** — veut **revenus réguliers**, comprend les **commissions** et **délais de retrait**.
3. **Fatou ( support plateforme )** — traite **litiges** avec **journal décisionnel**.
4. **Ibrahim ( admin )** — règle **commissions**, **catégories**, **feature flags** et **conformité**.

## 6. Parcours utilisateurs (synthèse)

- **Découverte** : accueil → catégorie → fiche service → profil vendeur → compte ou message.
- **Achat** : conversation → devis accepté **ou** achat direct → paiement → suivi → livraison → validation ou litige.
- **Vente** : onboarding vendeur → publication → inbox → devis → commande → livraison → encaissement différé (escrow) → retrait.
- **Litige** : ouverture → preuves → décision support → impact ledger (remboursement partiel/total, libération vendeur).

## 7. Règles métier (extraits normatifs)

- Une commande **payée** passe par des états **explicites** ; toute transition **journalisée**.
- Les fonds **escrow** ne sont **crédités au vendeur** qu’après **validation client** ou **règle de temporisation** ou **décision litige**.
- **Annulation** : selon état (non démarré / en cours / livré) avec politique plateforme **affichée avant paiement**.
- **Commission** : calculée sur le **montant HT ou TTC** (choix produit à figer) au moment de la commande.
- **Idempotence** : tout webhook paiement traité avec clé idempotente.

## 8. KPIs

- Activation vendeur (profil + 1er service publié), activation client (1ère commande payée).
- Taux conversion visite → inscription → commande.
- Délai médian de réponse vendeur ; taux de livraison à temps.
- Taux de litiges / commande ; NPS ou satisfaction simple post-livraison.
- GMV, take rate, taux d’échec paiement, taux d’abandon checkout.

## 9. Risques et mitigations (extrait — voir liste complète livrable chat)

- **Dérapage scope** → phases MVP strictes, feature flags.
- **Confiance / fraude** → escrow, vérifications progressives, limites montants.
- **Complexité paiement** → ledger interne + un PSP principal, documentation `integration-chariow.md`.
- **Performance mobile** → SSR/ISR ciblée, assets optimisés, files pour jobs lourds.

---

**Livrables Phase 0 :** ce document + sections A–L du message de synthèse + alignement équipe sur MVP.

**Prochaine étape recommandée :** Phase 1 (architecture technique, modèle de données, stratégie sécurité et intégration Chariow) — voir `phase-1-architecture-technique.md`.
