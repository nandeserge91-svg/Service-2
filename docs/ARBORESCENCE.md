# Arborescence du projet

Mise à jour Phase 5 — Implémentation jalons 5.2 (i18n), 5.3 (KYC), 5.4 (coupons), 5.5 (PWA).

```
Service 2/
├── messages/
│   ├── fr.json                         ← next-intl — UI publique FR
│   └── en.json                         ← next-intl — UI publique EN
├── docs/
│   ├── ARBORESCENCE.md
│   ├── phase-0-cadrage-produit.md
│   ├── phase-1-architecture-technique.md
│   ├── phase-2-ux-ui.md
│   ├── phase-3-initialisation.md
│   ├── phase-4-developpement.md
│   ├── phase-5-croissance-et-evolution.md  ← Roadmap post-MVP (V2/V3, jalons 5.x)
│   ├── deploiement.md              ← Guide prod : env, health, Docker, Sentry, Chariow, backups
│   ├── conformite-et-logs.md       ← Rate limit, en-têtes, rétention logs, chantier RGPD
│   ├── RELEASE_NOTES.md            ← Notes de publication (alimente /aide/versions)
│   └── integration-chariow.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
├── middleware.ts                          ← Auth dashboard + rate limit POST credentials (exclure /monitoring si matcher élargi)
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                    ← NextIntlClientProvider + lang cookie + OG + maintenance + metadataBase
│   │   ├── global-error.tsx              ← Erreur racine App Router + Sentry captureException
│   │   ├── loading.tsx                   ← Skeleton accueil
│   │   ├── page.tsx                      ← Homepage (JSON-LD Organization + WebSite)
│   │   ├── sitemap.ts                    ← Sitemap XML dynamique
│   │   ├── robots.ts                     ← robots.txt
│   │   ├── conditions/page.tsx           ← CGU (11 articles)
│   │   ├── confidentialite/page.tsx      ← Politique de confidentialité
│   │   ├── a-propos/page.tsx             ← À propos (mission, valeurs)
│   │   ├── contact/page.tsx              ← Contact (canaux + formulaire)
│   │   ├── statut/page.tsx               ← État des services (+ lien statut externe optionnel)
│   │   ├── aide/
│   │   │   ├── faq/page.tsx              ← FAQ structurée (4 catégories)
│   │   │   ├── guide-client/page.tsx     ← Guide client (6 étapes)
│   │   │   ├── guide-vendeur/page.tsx    ← Guide vendeur (6 étapes + conseils)
│   │   │   └── versions/page.tsx         ← Notes de version (lit docs/RELEASE_NOTES.md)
│   │   ├── api/
│   │   │   ├── cron/outbox/route.ts         ← GET file e-mails PostgreSQL (secret CRON_SECRET)
│   │   │   ├── health/route.ts              ← GET santé app + DB (LB, Docker HEALTHCHECK)
│   │   │   ├── auth/[...nextauth]/route.ts   ← Auth.js handlers
│   │   │   ├── categories/route.ts            ← GET categories
│   │   │   ├── cron/outbox/route.ts         ← GET file e-mails PostgreSQL (CRON_SECRET)
│   │   │   ├── conversations/
│   │   │   │   ├── route.ts                   ← GET conversations list
│   │   │   │   └── [id]/
│   │   │   │       ├── messages/route.ts      ← GET messages (paginated)
│   │   │   │       ├── offers/route.ts        ← GET offers in conversation
│   │   │   │       └── read/route.ts          ← POST mark as read
│   │   │   ├── profile/me/route.ts            ← GET current profile
│   │   │   ├── wallet/route.ts                ← GET wallet + withdrawals
│   │   │   ├── webhooks/chariow/route.ts      ← POST Chariow Pulse handler
│   │   │   ├── notifications/
│   │   │   │   ├── route.ts                   ← GET notifications paginées
│   │   │   │   ├── read/route.ts              ← POST marquer lues
│   │   │   │   ├── unread-count/route.ts      ← GET compteur non-lues
│   │   │   │   └── stream/route.ts            ← SSE temps réel
│   │   │   ├── reviews/route.ts               ← GET reviews paginées
│   │   │   └── sellers/[id]/reputation/route.ts ← GET score vendeur
│   │   ├── auth/
│   │   │   ├── layout.tsx                     ← Auth pages wrapper
│   │   │   ├── connexion/page.tsx             ← Login
│   │   │   └── inscription/
│   │   │       ├── page.tsx                   ← Client registration
│   │   │       └── vendeur/page.tsx           ← Seller registration
│   │   ├── services/
│   │   │   ├── page.tsx                       ← Browse services
│   │   │   └── [slug]/
│   │   │       ├── page.tsx                   ← Service detail + generateMetadata + JSON-LD
│   │   │       └── loading.tsx                ← Skeleton service
│   │   ├── api/
│   │   │   ├── push/subscribe/route.ts        ← Push subscription CRUD (6.1)
│   │   │   ├── cron/reminders/route.ts        ← Relances automatiques cron (6.5)
│   │   │   └── ...
│   │   ├── blog/
│   │   │   ├── page.tsx                       ← Liste articles publiés (5.6)
│   │   │   └── [slug]/page.tsx                ← Article détail + SEO (5.6)
│   │   ├── comparer/
│   │   │   └── page.tsx                       ← Comparaison côte-à-côte (6.3)
│   │   ├── recherche/
│   │   │   ├── page.tsx                       ← Search + filters + generateMetadata
│   │   │   └── loading.tsx                    ← Skeleton recherche
│   │   ├── paiement/
│   │   │   ├── simulation/page.tsx            ← Simulation paiement (dev)
│   │   │   ├── succes/page.tsx                ← Retour paiement réussi
│   │   │   └── annule/page.tsx                ← Retour paiement annulé
│   │   └── tableau-de-bord/
│   │       ├── layout.tsx                     ← Auth gate
│   │       ├── page.tsx                       ← Role-based redirect
│   │       ├── admin/
│   │       │   ├── layout.tsx                 ← ADMIN/SUPPORT gate + sidebar
│   │       │   ├── page.tsx                   ← Dashboard KPIs plateforme
│   │       │   ├── analytiques/page.tsx       ← Séries 7/30/90j (commandes, users, GMV, commissions)
│   │       │   ├── utilisateurs/page.tsx      ← Gestion utilisateurs
│   │       │   ├── services/page.tsx          ← Modération services
│   │       │   ├── retraits/page.tsx          ← Approbation retraits
│   │       │   ├── audit/page.tsx             ← Journal d'audit paginé
│   │       │   ├── kyc/page.tsx              ← Vérification KYC vendeurs (5.3)
│   │       │   ├── coupons/page.tsx          ← Gestion coupons CRUD (5.4)
│   │       │   ├── blog/page.tsx            ← CMS blog : CRUD articles (5.6)
│   │       │   ├── moderation/page.tsx     ← Signalements + SLA support (7.2)
│   │       │   ├── metriques/page.tsx      ← KPIs plateforme (7.3)
│   │       │   ├── feature-flags/page.tsx  ← Feature flags DB CRUD (7.4)
│   │       │   └── litiges/
│   │       │       ├── page.tsx               ← Liste litiges + KPIs
│   │       │       └── [id]/page.tsx          ← Détail + thread + résolution
│   │       ├── client/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx                   ← Client dashboard
│   │       │   ├── profil/page.tsx            ← Client profile edit
│   │       │   ├── commandes/
│   │       │   │   ├── page.tsx               ← Liste commandes client
│   │       │   │   └── [id]/page.tsx          ← Détail commande client
│   │       │   ├── historique/page.tsx        ← Historique d'achat + graphique mensuel (Phase 4.49)
│   │       │   ├── favoris/page.tsx           ← Services favoris (Phase 4.50)
│   │       │   ├── paiements/page.tsx         ← Historique paiements (Phase 4.50)
│   │       │   ├── litiges/page.tsx           ← Mes litiges (Phase 4.50)
│   │       │   ├── messages/
│   │       │   │   ├── layout.tsx             ← Split-panel messages
│   │       │   │   ├── page.tsx               ← Liste conversations
│   │       │   │   └── [id]/page.tsx          ← Fil de conversation
│   │       │   ├── parrainage/page.tsx        ← Parrainage : code, stats, historique (5.6)
│   │       │   └── notifications/page.tsx     ← Centre de notifications
│   │       └── vendeur/
│   │           ├── layout.tsx                 ← Seller role guard
│   │           ├── page.tsx                   ← Seller dashboard
│   │           ├── profil/page.tsx            ← Seller profile edit
│   │           ├── services/
│   │           │   ├── page.tsx               ← My services list
│   │           │   └── nouveau/page.tsx       ← Create service
│   │           ├── commandes/
│   │           │   ├── page.tsx               ← Liste commandes vendeur
│   │           │   └── [id]/page.tsx          ← Détail commande vendeur
│   │           ├── messages/
│   │           │   ├── layout.tsx
│   │           │   ├── page.tsx
│   │           │   └── [id]/page.tsx
│   │           ├── revenus/page.tsx           ← Dashboard revenus + KPIs
│   │           ├── performances/page.tsx      ← Analytics vendeur CA / commandes / top services (4.49)
│   │           ├── avis/page.tsx              ← Avis reçus + note globale (Phase 4.50)
│   │           ├── abonnement/page.tsx        ← Plans vendeur FREE/PRO/PREMIUM (5.6)
│   │           ├── kyc/page.tsx              ← Soumission vérification KYC vendeur (5.3)
│   │           ├── retraits/page.tsx          ← Demande retrait + historique
│   │           └── notifications/page.tsx     ← Re-export client notifications
│   ├── components/
│   │   ├── layout/
│   │   │   ├── maintenance-banner.tsx         ← Bannière maintenance optionnelle (NEXT_PUBLIC_*)
│   │   │   ├── header.tsx                     ← Nav + next-intl + LanguageSwitcher
│   │   │   ├── footer.tsx                     ← Footer dark + getTranslations (catégories DB = nameFr)
│   │   │   ├── language-switcher.tsx         ← Cookie NEXT_LOCALE fr/en + refresh
│   │   ├── service-worker-register.tsx  ← Auto-register /sw.js (6.1)
│   │   │   ├── breadcrumbs.tsx                ← Fil d'Ariane réutilisable (9 pages)
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── static-page-layout.tsx         ← Layout pages statiques (+ breadcrumbs optionnel)
│   │   │   └── dashboard-sidebar.tsx          ← Role-based nav (+ KYC vendeur, Coupons & KYC admin)
│   │   ├── analytics/
│   │   │   └── analytics-bar-chart.tsx        ← Barres CSS (séries Phase 4.49)
│   │   ├── messaging/
│   │   │   ├── conversation-list.tsx          ← Liste conversations (polling 10s)
│   │   │   ├── chat-thread.tsx                ← Fil de discussion + offres
│   │   │   ├── message-input.tsx              ← Saisie message + auto-resize
│   │   │   ├── offer-card.tsx                 ← Carte offre (statuts + accept/reject)
│   │   │   ├── offer-form.tsx                 ← Modal création offre
│   │   │   └── offer-panel.tsx                ← Panneau offres dans conversation
│   │   ├── orders/
│   │   │   ├── order-actions.tsx              ← Actions contextuelles buyer/seller
│   │   │   └── order-timeline.tsx             ← Chronologie événements commande
│   │   ├── notifications/
│   │   │   ├── notification-bell.tsx          ← Cloche + dropdown SSE temps réel
│   │   │   └── push-manager.tsx              ← Toggle push subscription VAPID (6.1)
│   │   ├── reviews/
│   │   │   ├── star-rating.tsx                ← Étoiles interactives/lecture
│   │   │   ├── review-card.tsx                ← Carte d'avis complète
│   │   │   ├── review-form.tsx                ← Formulaire soumission avis
│   │   │   ├── seller-response-form.tsx       ← Réponse vendeur inline
│   │   │   └── reputation-summary.tsx         ← Score + distribution barres
│   │   ├── disputes/
│   │   │   ├── dispute-thread.tsx             ← Fil discussion litige
│   │   │   └── dispute-admin-actions.tsx      ← Actions admin (review/resolve)
│   │   ├── admin/
│   │   │   ├── user-admin-actions.tsx         ← Suspendre/activer utilisateur
│   │   │   ├── service-admin-actions.tsx      ← Publier/archiver service
│   │   │   └── withdrawal-admin-actions.tsx   ← Approuver/refuser/verser retrait
│   │   ├── search/
│   │   │   ├── search-bar.tsx                 ← Barre recherche header + suggestions
│   │   │   ├── search-filters.tsx             ← Sidebar filtres multi-critères
│   │   │   ├── search-sort.tsx                ← Sélecteur de tri
│   │   │   ├── search-active-filters.tsx      ← Chips filtres actifs
│   │   │   ├── search-pagination.tsx          ← Pagination numérotée
│   │   │   ├── mobile-filter-toggle.tsx       ← Drawer filtres mobile
│   │   │   └── service-result-card.tsx        ← Carte résultat enrichie
│   │   ├── help/
│   │   │   ├── faq-accordion.tsx              ← Accordéon FAQ animé
│   │   │   └── contact-form.tsx               ← Formulaire contact
│   │   ├── providers.tsx                      ← SessionProvider + Toast
│   │   └── ui/
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── empty-state.tsx
│   │       ├── input.tsx
│   │       ├── modal.tsx
│   │       ├── skeleton.tsx
│   │       ├── status-pill.tsx
│   │       ├── textarea.tsx
│   │       └── toast.tsx
│   ├── i18n/
│   │   └── request.ts                 ← next-intl getRequestConfig (cookie NEXT_LOCALE)
│   ├── instrumentation.ts                 ← Next register + onRequestError (Sentry)
│   ├── instrumentation-client.ts          ← Init Sentry client + router transitions
│   ├── sentry.shared.ts                   ← DSN serveur / navigateur
│   ├── sentry.server.config.ts            ← Init Sentry Node
│   ├── sentry.edge.config.ts              ← Init Sentry Edge
│   ├── lib/
│   │   ├── auth.ts                    ← NextAuth full config + Prisma
│   │   ├── auth.config.ts             ← Edge-compatible auth config
│   │   ├── auth-actions.ts            ← Register client / seller (+ rate limit IP)
│   │   ├── client-ip.ts               ← IP client depuis headers (proxy)
│   │   ├── rate-limit-memory.ts       ← Limiteur glissant en mémoire (+ tests)
│   │   ├── feature-flags.ts           ← Flags serveur FEATURE_* (Phase 4.61)
│   │   ├── deferred.ts                ← deferAfterResponse (Next after + repli)
│   │   ├── service-actions.ts         ← Create service
│   │   ├── profile-actions.ts         ← Update profiles
│   │   ├── messaging-actions.ts       ← Conversations + messages
│   │   ├── offer-actions.ts           ← Offres + accept → Order
│   │   ├── order-actions.ts           ← Cycle de vie commandes
│   │   ├── payment-actions.ts        ← Initiation + confirmation paiement
│   │   ├── chariow.ts               ← Client API Chariow + mode simulation
│   │   ├── review-actions.ts        ← Submit/respond/reputation
│   │   ├── dispute-actions.ts       ← Open/message/review/resolve litiges
│   │   ├── admin-actions.ts        ← Server actions admin (suspend/publish/withdraw)
│   │   ├── search.ts               ← Moteur recherche multi-critères + sync
│   │   ├── jsonld.ts              ← Générateurs JSON-LD (Organization, Service, Breadcrumb)
│   │   ├── outbox-email.ts          ← File PostgreSQL e-mails (enqueue + batch + dispatch)
│   │   ├── locale-actions.ts        ← setUserLocale (cookie NEXT_LOCALE)
│   │   ├── analytics.ts             ← Agrégations historique / analytics (vendeur, admin SQL, client)
│   │   ├── contact-actions.ts       ← Formulaire contact → outbox + rate limit IP
│   │   ├── coupon-actions.ts        ← Validation coupon + admin CRUD + usage (5.4)
│   │   ├── kyc-actions.ts           ← Soumission KYC vendeur + review admin (5.3)
│   │   ├── subscription-actions.ts  ← Plans vendeur + souscription/annulation (5.6)
│   │   ├── referral-actions.ts      ← Parrainage : code, application, crédit bonus (5.6)
│   │   ├── blog-actions.ts          ← CRUD blog posts admin (5.6)
│   │   ├── push.ts                  ← web-push VAPID + sendPushToUser (6.1)
│   │   ├── recommendation-actions.ts ← Similar, compare, popular, recent services (6.3)
│   │   ├── reminders.ts             ← Relances automatiques : abandon, messages, avis (6.5)
│   │   ├── trust-actions.ts         ← TrustScore compute + SpendingLimit check (7.1)
│   │   ├── report-actions.ts        ← Signalements submit + admin review (7.2)
│   │   ├── metrics.ts               ← Métriques plateforme (7.3)
│   │   ├── flag-actions.ts          ← Feature flags DB + env fallback (7.4)
│   │   ├── audit.ts                 ← Service audit log
│   │   ├── notifications.ts         ← Dispatchers événementiels (11 events)
│   │   ├── email.ts                 ← nodemailer + 9 templates HTML
│   │   ├── ledger.ts                 ← Comptabilité double-entry
│   │   ├── escrow.ts                 ← Hold/release/freeze/refund séquestre
│   │   ├── wallet.ts                 ← Retrait vendeur
│   │   ├── constants.ts
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   ├── __mocks__/                ← Mocks Vitest (prisma, auth, email, audit, notifications, search)
│   │   ├── utils.test.ts             ← Tests cn, formatPrice, formatDate, slugify
│   │   ├── constants.test.ts         ← Tests labels, couleurs, icônes, constantes
│   │   ├── jsonld.test.ts            ← Tests Schema.org JSON-LD
│   │   ├── ledger.test.ts            ← Tests double-entry balance
│   │   ├── escrow.test.ts            ← Tests state machine escrow
│   │   ├── analytics.test.ts         ← Tests fenêtre temporelle + séries (4.49)
│   │   ├── outbox-email.test.ts      ← Tests batch outbox (mock Prisma + sendMail)
│   │   ├── contact-actions.test.ts   ← Tests validation + XSS + enqueue outbox + rate limit
│   │   ├── rate-limit-memory.test.ts ← Tests limiteur en mémoire
│   │   ├── feature-flags.test.ts     ← Tests feature flags
│   │   ├── deferred.test.ts          ← Tests deferAfterResponse
│   │   ├── review-actions.test.ts    ← Tests submit/respond/reputation
│   │   └── admin-actions.test.ts     ← Tests RBAC + toutes actions admin
│   └── types/
│       └── next-auth.d.ts             ← Session type extensions
├── public/
│   ├── manifest.json                ← PWA manifest (5.5)
│   └── icons/                       ← Icônes PWA 192×192 / 512×512 (à fournir)
├── Dockerfile                       ← Image prod multi-stage (Next standalone + Prisma)
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts                         ← createNextIntlPlugin + withSentryConfig (tunnel /monitoring)
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── vitest.config.ts                 ← Config Vitest (alias @/, node env, coverage v8)
```

**Décisions techniques Phase 3 :**
- Next.js à la racine (pas dans `apps/web/`) pour simplifier le MVP ; restructuration monorepo différée.
- Prisma 7 : `prisma.config.ts` + driver adapter `@prisma/adapter-pg` (breaking change vs Prisma 5/6).
- Tailwind 4 : design tokens via `@theme` en CSS natif ; plus de `tailwind.config.ts`.
- ESLint 9 : flat config `eslint.config.mjs`.

**Décisions techniques Phase 4 :**
- Auth.js v5 (next-auth@beta) avec stratégie JWT (pas de session DB — simplifie le middleware edge).
- `auth.config.ts` séparé de `auth.ts` : le config edge-compatible est utilisé par le middleware, la config complète avec Prisma par les API routes.
- Les vendeurs reçoivent automatiquement le rôle CLIENT en plus de SELLER.
- Les profils sont modifiables via server actions (`profile-actions.ts`).
- Les services sont créés via server action (`service-actions.ts`) avec package de base obligatoire.
- Les pages à accès DB sont marquées `force-dynamic` quand elles n'ont pas de params dynamiques.
- Phase 4.45 : `simulatePayment` supprimée, remplacée par `initiatePayment` → Chariow checkout / simulation locale.
- Le webhook Chariow est idempotent et valide la signature HMAC-SHA256.
- Phase 4.46 : notifications fire-and-forget, SSE temps réel avec fallback polling, nodemailer@7 pour emails.
- Phase 4.48 : litiges avec fil dédié (DisputeMessage), audit log, dashboard admin protégé ADMIN/SUPPORT.
- Phase 4.55 : Vitest 4.1.3, mocks manuels pour toutes les dépendances externes, 87 tests couvrant logique métier et server actions.
- Phase 4.56 : Footer dark dynamique (catégories DB), header avec dropdown catégories + mobile enrichi, breadcrumbs réutilisables sur 9 pages publiques.
- Phase 4.57 : Skip link + main landmark, reduced-motion, Avatar next/image + repli img, remotePatterns, polish transitions Button/Card/ServiceResultCard, next.config (compress, poweredByHeader).
- Phase 4.58 : `GET /api/health`, `output: "standalone"`, Dockerfile + HEALTHCHECK, `docs/deploiement.md`, variables prod dans `.env.example`, script `docker:build`.
- Phase 4.59 : rate limit (middleware auth credentials, register, contact), CSP + en-têtes + HSTS optionnel (`next.config.ts`), `conformite-et-logs.md`, confidentialité enrichie, `client-ip` + `rate-limit-memory`.
- Phase 4.60 : bannière maintenance (`MaintenanceBanner`), `/statut` + `StatusPanel`, `/aide/versions` + `RELEASE_NOTES.md`, sitemap, checklist & § déploiement (gel de version).
- Phase 4.61 : `NEXT_PUBLIC_EXTERNAL_STATUS_URL` sur `/statut`, `feature-flags` + tests, doc déploiement §9.
- Phase 4.62 : `@sentry/nextjs`, instrumentation, `global-error`, tunnel `/monitoring`, doc déploiement §6, backlog queue/i18n/Phase 5.
- Phase 4.63 : `deferAfterResponse` + e-mails notifications/contact via `after()`, tests `deferred.test.ts`.
- Phase 4.64 : table `EmailOutbox` + `outbox-email.ts` + route `GET /api/cron/outbox` ; `next-intl` + `messages/*` + cookie `NEXT_LOCALE` (header/footer/layout).
- Phase 4.49 : `analytics.ts` + pages vendeur `/performances`, admin `/analytiques`, client `/historique` ; bar chart léger.
- Phase 4.50 : Onboarding checklist dynamique (vendeur + client), dashboards branchés DB, pages favoris, paiements, litiges client, avis vendeur.
- Phase 5 : cadrage `phase-5-croissance-et-evolution.md` (V2/V3, jalons 5.1–5.6 indicatifs) — implémentation à planifier par tickets.
- Phase 5.2 : i18n étendue aux pages publiques (Home, About, Contact, Search, Services) — 6 namespaces dans `messages/*.json`.
- Phase 5.3 : KYC vendeur — soumission (`kyc-actions.ts`, `/vendeur/kyc`), revue admin (`/admin/kyc`), notification décision.
- Phase 5.4 : Système de coupons — modèle Prisma `Coupon`, `couponId`/`discountMinor` sur `Order`, validation au checkout, CRUD admin (`/admin/coupons`).
- Phase 5.5 : PWA — `public/manifest.json`, meta `manifest` + `appleWebApp` dans layout, placeholder icônes.
- Phase 5.6 : V3 pilotes — `SellerSubscription` (FREE/PRO/PREMIUM), `Referral` (parrainage code + crédit), `BlogPost` (CMS admin + pages publiques /blog).
- Phase 6.1 : Push notifications — `PushSubscription`, `public/sw.js`, `web-push` VAPID, `PushManager` toggle dans header, envoi push intégré à `notifications.ts`.
- Phase 6.2 : Centre notifications unifié — API enrichie (filtres status/search), groupement par date, icônes catégorie.
- Phase 6.3 : Recommandations — `SimilarServices` sur fiche, `/comparer` côte-à-côte, `recommendation-actions.ts`.
- Phase 6.4 : i18n étendue — hreflang alternates, `getUserLocale()` e-mails, sidebar dashboard FR/EN.
- Phase 6.5 : Relances automatiques — `/api/cron/reminders`, commandes abandonnées, messages non lus, avis manquants.
- Phase 7.1 : Anti-fraude — `TrustScore` (score 0-100), `SpendingLimit` (quotidien/mensuel), `computeTrustScore()`, `checkSpendingLimit()`.
- Phase 7.2 : Modération — `Report` (signalements), page admin `/moderation`, SLA support affiché.
- Phase 7.3 : Observabilité — `metrics.ts`, page admin `/metriques` (KPIs, taux, GMV, temps résolution).
- Phase 7.4 : Feature flags DB — `FeatureFlag`, `isFeatureEnabled()`, page admin `/feature-flags` CRUD + toggle.
