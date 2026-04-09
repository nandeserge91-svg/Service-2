# Phase 3 — Initialisation du projet

## Objectifs

Mettre en place le socle technique opérationnel : repo, dépendances, config lint/format, design tokens CSS, composants UI de base, layout applicatif, page d'accueil statique, Prisma client + seed, prêt pour la Phase 4 (développement incrémental).

## Stack installée

| Outil | Version | Rôle |
|-------|---------|------|
| **Node.js** | 24.14 | Runtime |
| **Next.js** | 16.2 (Turbopack) | Framework full-stack |
| **React** | 19.x | UI |
| **TypeScript** | 6.x | Typage statique |
| **Tailwind CSS** | 4.2 (config CSS-native `@theme`) | Design tokens + utilitaires |
| **Prisma** | 7.7 + `@prisma/adapter-pg` | ORM + migrations |
| **Lucide React** | latest | Icônes |
| **clsx + tailwind-merge** | latest | Classe CSS composable (`cn()`) |
| **ESLint** | 9.x + `next/core-web-vitals` | Qualité |
| **Prettier** | 3.x + plugin Tailwind | Format |

### Adaptations Prisma 7 (changement majeur vs Prisma 5/6)

- `url` supprimé du bloc `datasource` dans `schema.prisma`.
- Nouveau fichier `prisma.config.ts` à la racine pour les migrations.
- `PrismaClient` instancié avec un **driver adapter** (`@prisma/adapter-pg`) qui gère la connexion PostgreSQL directe :
  ```ts
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  ```
- `prisma generate` fonctionne sans base live (génère les types).

### Adaptations Tailwind 4 (changement majeur vs Tailwind 3)

- Plus de `tailwind.config.ts` ; configuration via **CSS natif** `@theme` dans `globals.css`.
- PostCSS plugin : `@tailwindcss/postcss` (remplace `tailwindcss`).
- Design tokens couleurs déclarés dans `@theme { --color-primary-600: #2563EB; … }`.
- Les classes utilitaires (`bg-primary-600`, `text-success-500`, etc.) fonctionnent comme avant.

## Arborescence créée

```
Service 2/
├── docs/
│   ├── ARBORESCENCE.md
│   ├── phase-0-cadrage-produit.md
│   ├── phase-1-architecture-technique.md
│   ├── phase-2-ux-ui.md
│   ├── phase-3-initialisation.md
│   └── integration-chariow.md
├── prisma/
│   ├── schema.prisma            ← modèle Phase 1
│   └── seed.ts                  ← catégories + commission par défaut
├── prisma.config.ts             ← config Prisma 7 (migrations)
├── src/
│   ├── app/
│   │   ├── globals.css          ← Tailwind @import + @theme tokens
│   │   ├── layout.tsx           ← root layout (Inter, Header, Footer, Toast)
│   │   └── page.tsx             ← page d'accueil (wireframe Phase 2)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx       ← header responsive + recherche + auth
│   │   │   ├── footer.tsx       ← footer liens + langue
│   │   │   └── mobile-nav.tsx   ← barre de navigation mobile
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
│   │       └── toast.tsx        ← provider + useToast()
│   └── lib/
│       ├── constants.ts         ← labels, couleurs statuts, catégories
│       ├── prisma.ts            ← singleton Prisma + adapter PG
│       └── utils.ts             ← cn(), formatPrice(), formatDate(), slugify()
├── .env.example
├── .env                         ← placeholder local (non commité)
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Composants UI livrés (11)

| Composant | Variantes / Props | Notes |
|-----------|-------------------|-------|
| **Button** | primary, secondary, outline, ghost, danger ; sm/md/lg ; loading, icon | `forwardRef`, accessible |
| **Input** | label, error, hint ; aria-invalid, aria-describedby | Touch-friendly 44px |
| **Textarea** | label, error, hint | Multi-ligne |
| **Badge** | default, primary, success, warning, danger | Pill style |
| **Card** | hover, padding (none/sm/md/lg) ; CardHeader, CardTitle | Composable |
| **Avatar** | sm/md/lg ; src fallback initiales ; verified badge | Couleur déterministe |
| **Skeleton** | ligne + SkeletonCard pré-composé | Animation pulse |
| **StatusPill** | mapping automatique OrderStatus → couleur + label FR | Dot coloré |
| **EmptyState** | icon, title, description, actionLabel, actionHref | CTA intégré |
| **Modal** | dialog HTML natif, bottom-sheet mobile, title, onClose | Focus trap natif |
| **Toast** | success, error, warning, info ; auto-dismiss 5s | Provider + `useToast()` |

## Vérifications

- ✅ `npm run build` — compilation TypeScript et génération statique OK.
- ✅ `npm run dev` — serveur dev Turbopack, HTTP 200 sur `localhost:3000`.
- ✅ `npx prisma generate` — types générés dans `node_modules/@prisma/client`.

## Scripts disponibles

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur de développement Turbopack |
| `npm run build` | Build de production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:generate` | Prisma generate |
| `npm run db:push` | Push schema → base (dev) |
| `npm run db:migrate` | Migration Prisma |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seed catégories + commission |

---

**Prochaine étape recommandée :** Phase 4.38 — Authentification + rôles (Auth.js / credentials, inscription client/vendeur, vérif email, RBAC, middleware de protection des routes dashboard).
