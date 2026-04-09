# Guide de déploiement (Phase 4.58)

Ce document résume la mise en production de la marketplace : variables d’environnement, healthcheck, conteneur Docker, sauvegardes PostgreSQL, webhooks Chariow et monitoring (Sentry).

Pour le **rate limiting**, les **en-têtes de sécurité** et les **recommandations RGPD / logs**, voir aussi [`conformite-et-logs.md`](./conformite-et-logs.md).

Pour la **roadmap après MVP** (internationalisation, queues durables, V2/V3 produit), voir [`phase-5-croissance-et-evolution.md`](./phase-5-croissance-et-evolution.md).

---

## 1. Variables d’environnement (production)

Copier `.env.example` vers un fichier sécurisé (jamais commité) et renseigner au minimum :

| Variable | Obligatoire | Rôle |
|----------|-------------|------|
| `DATABASE_URL` | Oui | PostgreSQL (SSL recommandé en prod : `?sslmode=require`) |
| `NEXTAUTH_SECRET` | Oui | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Oui | URL publique HTTPS, ex. `https://app.example.com` |
| `NEXT_PUBLIC_APP_URL` | Oui | Même base URL (SEO, emails, redirections) |
| `NEXT_PUBLIC_APP_NAME` | Recommandé | Nom affiché |
| `CHARIOW_*` | Si paiement réel | Clé API, product ID, secret webhook (HTTPS uniquement) |
| `SMTP_*` / `EMAIL_FROM` | Recommandé | Emails transactionnels |
| `CHARIOW_WEBHOOK_SECRET` | Si webhooks | Doit correspondre au dashboard Chariow |

Optionnel :

- `CONTACT_EMAIL` — destinataire du formulaire contact.
- `CRON_SECRET` — secret pour `GET /api/cron/outbox` (file d’e-mails PostgreSQL, Phase 4.64) ; requis si vous appelez ce cron depuis l’extérieur (sinon la route répond 503).
- `SENTRY_DSN` — après intégration Sentry (voir §6).
- `NODE_ENV=production` — défini automatiquement sur la plupart des hébergeurs.

---

## 2. Healthcheck

- **URL :** `GET /api/health`
- **Réponse 200 :** `{ "status": "ok", "checks": { "database": true }, "version": "…", "timestamp": "…" }`
- **Réponse 503 :** base indisponible (`status: "degraded"`).

À configurer dans :

- **Docker** : directive `HEALTHCHECK` du `Dockerfile` (déjà présente).
- **Kubernetes** : `livenessProbe` / `readinessProbe` sur `/api/health`.
- **UptimeRobot / Better Stack / etc.** : ping HTTP toutes les 1–5 minutes.

---

## 3. Build & démarrage (Node classique)

```bash
npm ci
npx prisma migrate deploy   # ou db push une seule fois si pas de migrations versionnées
npm run build
npm run start
```

`next.config.ts` utilise `output: "standalone"` pour une image Docker légère.

---

## 4. Docker

```bash
docker build -t marketplace-services .
docker run --env-file .env.production -p 3000:3000 marketplace-services
```

**Important :** au premier déploiement, exécuter les migrations Prisma contre la base (job CI/CD ou conteneur one-shot `prisma migrate deploy`).

Si le moteur Prisma manque dans l’image (rare avec Next standalone), copier explicitement `node_modules/.prisma` et `node_modules/@prisma/client` depuis l’étape `builder` (voir [Prisma + Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)).

---

## 5. Sauvegardes PostgreSQL

- Activer les **backups automatiques** chez l’hébergeur (RDS, Supabase, Neon, etc.).
- À défaut, cron avec `pg_dump` :

```bash
pg_dump "$DATABASE_URL" -Fc -f "backup-$(date +%Y%m%d).dump"
```

Conserver les dumps chiffrés hors du serveur applicatif ; tester une **restauration** au moins une fois.

---

## 6. Monitoring — Sentry (Phase 4.62)

Le SDK **`@sentry/nextjs`** est déjà intégré (instrumentation, `global-error`, tunnel `/monitoring`, `withSentryConfig`).

1. Créer un projet sur [sentry.io](https://sentry.io) (ou instance self-hosted).
2. Renseigner les variables d’environnement (voir `.env.example`) puis **rebuild** l’application.
3. Optionnel CI : `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` pour l’upload des source maps (stack traces lisibles).

| Variable | Rôle |
|----------|------|
| `SENTRY_DSN` | DSN côté serveur (recommandé en prod) |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN navigateur (**obligatoire** pour les erreurs client ; peut être identique au DSN public du projet) |
| `SENTRY_ENVIRONMENT` / `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Filtre « environnement » dans Sentry (ex. `production`, `staging`) |
| `SENTRY_AUTH_TOKEN` | Upload source maps (CI, secret) |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Requis avec `SENTRY_AUTH_TOKEN` pour l’upload |

**Tunnel** : les événements peuvent transiter par `POST /monitoring` (contournement partiel des bloqueurs de pub). Le middleware d’auth actuel ne couvre pas cette route ; si vous élargissez le `matcher` du middleware, exclure `monitoring`.

Sans DSN, l’app fonctionne normalement : Sentry ne s’initialise pas. Sans Sentry du tout, surveiller au minimum les logs serveur et `GET /api/health`.

### E-mails : file PostgreSQL + après réponse HTTP (Phases 4.63–4.64)

Les e-mails déclenchés par **`src/lib/notifications.ts`** et le **formulaire contact** sont d’abord **persistés** dans la table Prisma `EmailOutbox`, puis traités par `processEmailOutboxBatch` **après** la réponse HTTP via `deferAfterResponse` (`after` de Next.js), comme en 4.63.

**Cron / retry** : planifier un appel périodique (ex. toutes les 1–5 minutes) :

- `GET https://votre-domaine.com/api/cron/outbox`
- En-tête `Authorization: Bearer <CRON_SECRET>` **ou** query `?secret=<CRON_SECRET>` (même valeur que la variable d’environnement).
- Query optionnelle `limit` (1–100, défaut 50).

Sans `CRON_SECRET` configuré, la route répond **503** (refus explicite d’exposer un cron public non protégé). Les lignes en échec sont réessayées jusqu’à 5 tentatives puis passent en `FAILED` (`lastError` conservé).

---

## 7. Chariow — checklist webhook

- [ ] URL webhook **HTTPS** publique, ex. `https://app.example.com/api/webhooks/chariow`
- [ ] Même URL configurée dans le dashboard Chariow
- [ ] `CHARIOW_WEBHOOK_SECRET` identique des deux côtés
- [ ] Tester un paiement test puis vérifier commande `PAID` + escrow en base

---

## 8. Checklist go-live

- [ ] DNS + certificat TLS (Let’s Encrypt ou CDN)
- [ ] Toutes les variables prod renseignées et revues
- [ ] `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` en HTTPS sans slash final incohérent
- [ ] Migrations Prisma appliquées
- [ ] Seed **non** exécuté en prod (données de démo)
- [ ] SMTP testé (inscription, commande, contact) ; file `EmailOutbox` appliquée (`prisma migrate` / `db push`) et cron `/api/cron/outbox` configuré si vous comptez sur les retries hors processus
- [ ] `/api/health` vert depuis l’extérieur (ou via LB)
- [ ] `robots.txt` / `sitemap.xml` cohérents avec le domaine final
- [ ] Désactiver ou protéger `/paiement/simulation` en prod si non souhaité
- [ ] Bannière maintenance : `NEXT_PUBLIC_MAINTENANCE_BANNER` à `0` / absent sauf besoin réel ; message personnalisé via `NEXT_PUBLIC_MAINTENANCE_MESSAGE` si activé
- [ ] `docs/RELEASE_NOTES.md` à jour ; optionnel : `NEXT_PUBLIC_APP_RELEASE_LABEL` (ex. `v0.1.0`) pour affichage sur `/statut` et `/aide/versions`
- [ ] Pages publiques `/statut` et `/aide/versions` vérifiées après déploiement
- [ ] Optionnel : `NEXT_PUBLIC_EXTERNAL_STATUS_URL` (Better Stack, Statuspage.io…) pour le lien sur `/statut`
- [ ] Sentry : `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_DSN` si souhaité) pour le suivi des erreurs ; tester un événement depuis l’UI ou une erreur volontaire en staging

---

## 9. Finitions lancement (Phase 4.60)

### Bannière de maintenance (optionnelle)

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_MAINTENANCE_BANNER` | `1`, `true` ou `yes` pour afficher une bannière dismissible sous le skip-link |
| `NEXT_PUBLIC_MAINTENANCE_MESSAGE` | Texte affiché (sinon message générique) |

Les variables `NEXT_PUBLIC_*` sont figées au **build** ; pour changer le message sans rebuild, prévoir un mécanisme externe (CMS, feature flag) dans une itération ultérieure.

### Statut public & notes de version

- **`/statut`** — Vue grand public alimentée par `GET /api/health` (application + base de données).
- **`/aide/versions`** — Affiche le contenu de [`RELEASE_NOTES.md`](./RELEASE_NOTES.md) ; à éditer à chaque release.

**Docker :** le `Dockerfile` copie `docs/RELEASE_NOTES.md` dans l’image (`./docs/RELEASE_NOTES.md` à côté du serveur standalone). Pour une autre méthode de déploiement, veiller à ce que ce fichier soit présent sur le disque au chemin attendu par l’app, ou reconstruire après modification.

### Gel de version (première mise en production)

1. Mettre à jour `docs/RELEASE_NOTES.md` (date, périmètre, tag cible).
2. Créer un tag Git : `git tag -a v0.1.0 -m "Première mise en production"` (adapter le numéro).
3. Publier la même référence sur l’artefact déployé (image Docker `:v0.1.0`, manifeste K8s, etc.).
4. Optionnel : `NEXT_PUBLIC_APP_RELEASE_LABEL=v0.1.0` en production pour cohérence UI / support.

### Post go-live (Phase 4.61)

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_EXTERNAL_STATUS_URL` | URL affichée sur `/statut` (« page de statut détaillée »), ex. fournisseur SaaS d’incidents |
| `FEATURE_<NOM>` | Flags booléens côté **serveur** (`1` / `true` / `yes`) — lire via `serverFeatureEnabled()` dans `src/lib/feature-flags.ts` |

Les flags `FEATURE_*` servent à déployer du code en sommeil puis l’activer sans nouveau build si l’hébergeur permet de changer les variables d’environnement au runtime (sinon rebuild nécessaire).

---

## 10. Vercel / Plateforme managée

Sur Vercel : lier le repo, définir les variables d’environnement, ajouter une base Postgres managée, définir `DATABASE_URL`, lancer `prisma migrate deploy` en commande de build ou via Vercel Postgres integration. L’image Docker du repo est surtout utile pour un **self-hosted** (VPS, Kubernetes, Railway avec Dockerfile, etc.).
