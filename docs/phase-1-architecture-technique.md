# Phase 1 — Architecture technique

## 10. Spécifications techniques détaillées

| Domaine | Choix | Justification |
|--------|--------|---------------|
| Frontend | **Next.js** (App Router) + **TypeScript** + **Tailwind CSS** | SSR/SSG pour SEO, API intégrées, écosystème mature, recrutement et maintenance |
| Backend | **Next.js** (Route Handlers, Server Actions) pour MVP ; extraction **NestJS** si équipe backend séparée ou besoin queues intégrées au même runtime | Un dépôt, moins de friction MVP ; frontière claire « domain services » pour migrer |
| Base de données | **PostgreSQL** | ACID, JSON, contraintes, idéal pour ledger et relations métier |
| ORM | **Prisma** | Migrations, types, DX ; adapté équipes petites/moyennes |
| Auth | **Auth.js (NextAuth v5)** ou équivalent + RBAC applicatif | Sessions sécurisées, extensible OAuth, contrôle rôles en base |
| Fichiers | **S3-compatible** (R2, MinIO dev) | Portfolio, pièces jointes, livrables ; URLs signées |
| Temps réel | **Server-Sent Events** ou **WebSocket** (Socket.io) selon charge ; notifications async | Messagerie + notifications ; découplable en service |
| Files / jobs | **BullMQ** + **Redis** (ou équivalent cloud) | Webhooks PSP, emails, relances, rapprochement |
| Observabilité | OpenTelemetry-ready, **Sentry**, logs structurés | Production SaaS |
| i18n | `next-intl` ou équivalent, **fr** puis **en** | Alignement produit |

## 11. Architecture applicative (logique)

```
[ Client Next.js ]
       │
       ▼
[ BFF / API Next — auth, validation, orchestration ]
       │
       ├──► [ PostgreSQL + Prisma ] ← source de vérité métier + financier
       ├──► [ Redis + BullMQ ] ← jobs (webhooks, emails, relances)
       ├──► [ Stockage objet ] ← médias
       └──► [ Chariow API ] ← encaissement (serveur uniquement)
```

**Principe :** le domaine « commande / escrow / commission » vit dans **notre** base ; Chariow confirme **l’encaissement** ; nous ne dépendons pas d’une fonction escrow Chariow (absente de la doc consultée).

## 12. Modules système

1. **Identity & Access** — utilisateurs, rôles, permissions, vérifications.
2. **Catalog** — catégories, services, packages, médias.
3. **Messaging** — conversations, pièces jointes, anti-spam basique.
4. **Commerce** — offres, commandes, états, livrables.
5. **Payments** — intents, mapping PSP, webhooks, idempotence.
6. **Ledger & Wallets** — comptes, écritures, soldes vendeur/plateforme.
7. **Escrow** — machine à états liée à Order + règles temporelles.
8. **Disputes & Moderation** — dossiers, preuves, décisions auditées.
9. **Reputation** — avis, agrégats vendeur.
10. **Notifications** — préférences, canaux.
11. **Admin & Support** — consoles ciblées par rôle.
12. **Analytics** — événements produit (privacy-friendly).

## 13–18. Flux métier (résumé structuré)

### Flux commande (happy path)

1. Client et vendeur échangent (optionnel) → devis `Offer` **ACCEPTED** ou achat direct service.
2. Création `Order` **PENDING_PAYMENT** avec montants figés (commission incluse côté calcul).
3. Création `PaymentIntent`(s) selon règle (full / deposit+balance).
4. Appel Chariow (ou widget) → retour `sale_id` / URL paiement → stockage preuve.
5. Webhook / poll contrôlé → `Order` **PAID** (ou partiellement) → écritures ledger + **escrow HOLD**.
6. Vendeur livre → client valide → **RELEASE** escrow → crédit **seller payable** (moins commission déjà ventilée selon modèle comptable retenu).
7. Retrait vendeur : `WithdrawalRequest` **PAID** avec référence sortante.

### Flux paiement (intégration)

- Toute transition financière a : acteur, `referenceType`/`referenceId`, montant, devise, `idempotencyKey`.
- Webhook Chariow : ack 200 immédiat → job file pour matcher `chariow_sale_id` (via `custom_metadata`).

### Flux escrow

- États : `NOT_HELD` | `HELD` | `RELEASED` | `REFUNDED` | `FROZEN_DISPUTE`.
- Sorties : validation client, timeout configuré, décision litige, annulation selon politique.

### Flux litige

- Ouverture → gel optionnel des fonds → échanges preuves → décision support/admin → écritures compensatrices + mise à jour commande.

### Flux retrait vendeur

- Demande si solde ≥ minimum et KYC si requis → revue fraud rules → paiement externe → réconciliation.

## 19. Modèle de données (conceptuel)

Entités clés : `User`, `SellerProfile`, `BuyerProfile`, `Category`, `Service`, `ServicePackage`, `Conversation`, `Message`, `Offer`, `Order`, `Payment`, `EscrowState`, `LedgerJournal`/`LedgerLine`, `WithdrawalRequest`, `Dispute`, `Review`, `Notification`, `AuditLog`, `CommissionRule`.

**Schéma Prisma initial :** `prisma/schema.prisma`.

## 20–21. Schéma Prisma & stratégie sécurité

- Voir fichier Prisma ; évolutions par migrations versionnées.

**Sécurité :**

- JWT/session httpOnly, CSRF sur actions mutantes, rate limiting (API + auth).
- Validation **Zod** (ou équivalent) partagée côté serveur.
- RBAC : politiques par ressource (ex. seul vendeur de la commande peut livrer).
- Stockage secrets env ; jamais clé Chariow client.
- Audit : actions sensibles `AuditLog` (admin, litige, mouvement fonds).
- Upload : scan taille/MIME, antivirus option V2, URLs signées TTL courtes.
- RGPD : minimisation données, export/suppression planifiés V2.

## 22. Intégration Chariow (limites réelles)

Voir `docs/integration-chariow.md`.

**En résumé :** pas d’API checkout pour produits **Service** / **Coaching** ; pas d’escrow marketplace natif ; utilisation comme **tunnel d’encaissement** + **Pulses** pour finaliser états internes ; wallet vendeur = **notre** ledger.

---

**Livrables Phase 1 :** ce document, `integration-chariow.md`, `prisma/schema.prisma`, diagrammes de flux (message de synthèse).

**Prochaine étape recommandée :** Phase 2 (design system, arborescence UX, wireframes textuels) puis Phase 3 (bootstrap Next.js, lint, seed).
