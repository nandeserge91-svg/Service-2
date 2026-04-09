# Phase 4 — Développement progressif

## État d'avancement

| Étape | Module | Statut |
|-------|--------|--------|
| 4.38 | Auth + rôles | ✅ Terminé |
| 4.39 | Profils utilisateurs | ✅ Terminé |
| 4.40 | Catalogue services | ✅ Terminé |
| 4.41 | Messagerie | ✅ Terminé |
| 4.42 | Offres / devis | ✅ Terminé |
| 4.43 | Commandes | ✅ Terminé |
| 4.44 | Wallet / ledger / escrow | ✅ Terminé |
| 4.45 | Paiements Chariow | ✅ Terminé |
| 4.46 | Notifications | ✅ Terminé |
| 4.47 | Avis / réputation | ✅ Terminé |
| 4.48 | Litiges / modération | ✅ Terminé |
| 4.49 | Historique / analytics | 🔲 À faire |
| 4.50 | Tutoriels / onboarding | 🔲 À faire |
| 4.51 | Admin dashboard | ✅ Terminé |
| 4.64 | File e-mails PostgreSQL + i18n publique (cookie `NEXT_LOCALE`) | ✅ Terminé |

---

## 4.38 — Authentification + rôles

### Stack auth

- **next-auth v5** (5.0.0-beta.30) — stratégie JWT, pas de session DB
- **bcryptjs** — hachage des mots de passe (pure JS, pas de binaire natif)
- **Architecture split** : `auth.config.ts` (edge-compatible, middleware) + `auth.ts` (Node.js, Prisma)

### Flux implémentés

1. **Inscription client** (`/auth/inscription`)
   - Champs : nom, email, mot de passe, confirmation
   - Crée `User` + `BuyerProfile` + rôle `CLIENT`
   - Auto-connexion après inscription
   - Redirige vers `/tableau-de-bord/client`

2. **Inscription vendeur** (`/auth/inscription/vendeur`)
   - Champs : nom pro, email, pays (select 21 pays africains), mot de passe
   - Crée `User` + `SellerProfile` + rôles `SELLER` + `CLIENT`
   - Auto-connexion → `/tableau-de-bord/vendeur`

3. **Connexion** (`/auth/connexion`)
   - Credentials provider (email + mot de passe)
   - Support `callbackUrl` pour redirection post-login
   - Enveloppé dans `<Suspense>` (requis Next.js 16 pour `useSearchParams`)

4. **Déconnexion** — via header dropdown, redirection vers `/`

### Middleware RBAC

- `middleware.ts` utilise `NextAuth(authConfig).auth`
- Protège `/tableau-de-bord/*` — redirige vers `/auth/connexion` si non authentifié
- Le layout vendeur vérifie le rôle `SELLER` côté serveur et redirige les non-vendeurs

### Session JWT

- Token contient : `id`, `email`, `name`, `image`, `roles[]`
- Types étendus dans `src/types/next-auth.d.ts`
- Accessible côté serveur via `auth()`, côté client via `useSession()`

### Header auth-aware

- Affiche avatar + dropdown si connecté (dashboard, profil, déconnexion)
- Affiche boutons Connexion/Inscription si visiteur
- Menu mobile complet avec les mêmes options

---

## 4.39 — Profils utilisateurs

### Dashboards

- **Redirecteur** (`/tableau-de-bord`) — redirige selon le rôle principal : ADMIN > SELLER > CLIENT
- **Client** — KPIs (commandes actives, messages non lus, actions requises), liste commandes récentes
- **Vendeur** — KPIs (revenus, commandes, note, taux à temps), checklist onboarding, liste services

### Sidebar navigation

- `DashboardSidebar` — composant client, role-aware
  - Client : 9 items (accueil, commandes, messages, favoris, paiements, litiges, notifications, profil, aide)
  - Vendeur : 11 items (accueil, services, commandes, messages, revenus, retraits, performances, avis, profil, notifications, aide)
  - Admin : 9 items (aperçu, utilisateurs, catégories, commandes, paiements, litiges, modération, paramètres, journal)
- Indicateur visuel de la page active

### Édition profils

- **Client** (`/tableau-de-bord/client/profil`) — nom, téléphone
- **Vendeur** (`/tableau-de-bord/vendeur/profil`) — nom pro, bio, ville, téléphone, langues
- Server actions avec validation
- API `/api/profile/me` pour charger les données côté client

---

## 4.40 — Catalogue services

### Création de service (`/tableau-de-bord/vendeur/services/nouveau`)

- Formulaire en 2 sections :
  1. **Informations** : titre, catégorie (grouped `<select>`), description
  2. **Offre de base** : nom, prix (FCFA, min 500), délai livraison, révisions, description
- 2 actions : **Brouillon** ou **Publier**
- Server action `createService()` avec :
  - Slug auto-généré (+ suffix anti-collision)
  - Création atomique service + package BASIC
  - Validation côté serveur (champs requis, prix minimum)
- API `/api/categories` pour alimenter le select de catégories

### Liste des services vendeur (`/tableau-de-bord/vendeur/services`)

- Affiche tous les services du vendeur connecté
- Badge de statut (Publié/Brouillon/Archivé)
- Prix de base, nombre de commandes et favoris
- Empty state avec CTA vers création

### Navigation publique

- **Page services** (`/services`) — catégories avec icônes + grille services récents
- **Page recherche** (`/recherche`) — barre de recherche, filtres par catégorie (sidebar), grille résultats
  - Recherche full-text sur titre + description (`contains`, `insensitive`)
  - Filtrage par catégorie via query param `?cat=slug`
  - Compteur de résultats

### Détail service (`/services/[slug]`)

- Breadcrumb (Services > Catégorie parente > Catégorie)
- Infos vendeur (avatar, nom, badge vérifié, ville, note)
- Description complète
- FAQ (accordéons `<details>`)
- Avis récents (via `Review` → `Order` → `Service`)
- Sidebar sticky :
  - Packages avec prix, délai, révisions
  - Boutons Commander + Contacter
  - Badge de confiance escrow
  - Options/extras

---

## Routes créées cette phase

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/auth/connexion` | Static | - | Page de connexion |
| `/auth/inscription` | Static | - | Inscription client |
| `/auth/inscription/vendeur` | Static | - | Inscription vendeur |
| `/api/auth/[...nextauth]` | Dynamic | - | Handlers Auth.js |
| `/api/categories` | Dynamic | - | Liste catégories |
| `/api/profile/me` | Dynamic | Auth | Profil utilisateur courant |
| `/services` | Dynamic | - | Browse services |
| `/services/[slug]` | Dynamic | - | Détail service |
| `/recherche` | Dynamic | - | Recherche + filtres |
| `/tableau-de-bord` | Dynamic | Auth | Redirecteur par rôle |
| `/tableau-de-bord/client` | Dynamic | Auth | Dashboard client |
| `/tableau-de-bord/client/profil` | Dynamic | Auth | Profil client |
| `/tableau-de-bord/vendeur` | Dynamic | Auth + SELLER | Dashboard vendeur |
| `/tableau-de-bord/vendeur/profil` | Dynamic | Auth + SELLER | Profil vendeur |
| `/tableau-de-bord/vendeur/services` | Dynamic | Auth + SELLER | Mes services |
| `/tableau-de-bord/vendeur/services/nouveau` | Dynamic | Auth + SELLER | Créer service |

---

## 4.41 — Messagerie

### Modifications schéma Prisma

- `SellerProfile` : ajout `phone String?` et `languages String[] @default([])`
- `Conversation` : ajout `serviceId String?` + relation `Service?` (pour lier une conversation à un service)
- `Service` : ajout relation inverse `conversations Conversation[]`

### Architecture messagerie

**Pattern client-serveur avec polling** (MVP) :
- Les composants client (`ConversationList`, `ChatThread`) font du polling régulier via `fetch` (10s pour la liste, 4s pour le thread)
- L'envoi de messages passe par un server action `sendMessage()` pour la sécurité et la validation
- Le marquage lu passe par le server action `markConversationRead()` automatiquement à l'ouverture
- L'upgrade vers SSE/WebSocket est prévu en V2 (le polling est suffisant pour le MVP avec les volumes attendus)

### Server actions (`messaging-actions.ts`)

| Action | Rôle |
|--------|------|
| `getOrCreateConversation(otherUserId, serviceId?)` | Trouve ou crée une conversation DIRECT entre 2 users |
| `contactSeller(formData)` | Action formulaire : crée la conversation et redirige vers `/messages/{id}` |
| `sendMessage(conversationId, body)` | Envoie un message avec validation (participant check, non-vide) |
| `markConversationRead(conversationId)` | Met à jour `lastReadAt` du participant courant |

### API routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/conversations` | GET | Liste des conversations de l'utilisateur avec dernier message, unread count, info autre participant |
| `/api/conversations/[id]/messages` | GET | Messages d'une conversation (pagination cursor, 50 par batch) |
| `/api/conversations/[id]/read` | POST | Marque la conversation comme lue |

### Composants réutilisables (`src/components/messaging/`)

1. **`ConversationList`** — Liste des conversations avec :
   - Avatar et nom de l'interlocuteur
   - Aperçu du dernier message (tronqué)
   - Horodatage relatif (à l'instant / 5min / 2h / 3j)
   - Badge non-lu avec compteur
   - Nom du service si applicable
   - Polling auto-refresh 10s
   - Skeleton loading + empty state

2. **`ChatThread`** — Fil de discussion avec :
   - Header (avatar + nom interlocuteur + nom service)
   - Messages groupés par jour (séparateur date)
   - Bulles : bleu à droite (moi), gris à gauche (autre), centré (système)
   - Auto-scroll vers le nouveau message
   - Horodatage par message
   - Affichage des pièces jointes (lien)
   - Polling auto-refresh 4s
   - Marquage lu automatique à l'ouverture

3. **`MessageInput`** — Zone de saisie :
   - Textarea auto-resize (1 → 5 lignes)
   - Envoi via Entrée (Shift+Entrée pour saut de ligne)
   - Bouton d'envoi avec état actif/inactif
   - Restauration du texte en cas d'erreur d'envoi

### Pages

| Route | Layout | Description |
|-------|--------|-------------|
| `.../client/messages` | Split panel (sidebar + empty state) | Liste conversations client |
| `.../client/messages/[id]` | Split panel (sidebar + thread) | Chat client |
| `.../vendeur/messages` | Split panel | Liste conversations vendeur |
| `.../vendeur/messages/[id]` | Split panel | Chat vendeur |

Layout messages : container fixe `h-[calc(100vh-8rem)]` avec sidebar 320px à gauche (desktop) et chat à droite. Sur mobile, la liste prend tout l'écran, la conversation aussi.

### Intégration service detail

Le bouton "Contacter le vendeur" sur `/services/[slug]` est un `<form action={contactSeller}>` avec hidden inputs (`sellerUserId`, `serviceId`). Il :
1. Vérifie l'authentification (redirige vers `/auth/connexion` si non connecté)
2. Crée ou trouve la conversation existante entre le client et le vendeur pour ce service
3. Redirige vers la bonne page messages selon le rôle (client ou vendeur)

### Sécurité

- Vérification de participation : l'API et les actions vérifient que l'utilisateur est bien participant de la conversation
- Transaction atomique pour l'envoi : message + update `updatedAt` + update `lastReadAt` en une seule transaction
- Pas de message vide (validation côté serveur)
- Pas de conversation avec soi-même

---

## Routes ajoutées Phase 4.41

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/api/conversations` | Dynamic | Auth | Liste conversations |
| `/api/conversations/[id]/messages` | Dynamic | Auth | Messages d'une conversation |
| `/api/conversations/[id]/read` | Dynamic | Auth | Marquer comme lu |
| `.../client/messages` | Dynamic | Auth | Liste messages client |
| `.../client/messages/[id]` | Dynamic | Auth | Chat client |
| `.../vendeur/messages` | Dynamic | Auth + SELLER | Liste messages vendeur |
| `.../vendeur/messages/[id]` | Dynamic | Auth + SELLER | Chat vendeur |

---

## 4.42 — Offres / devis personnalisés

### Modifications schéma Prisma

- `Order.servicePackageId` → `String?` (optionnel) pour supporter les commandes issues d'offres personnalisées (pas de package catalogue)
- `Order.servicePackage` → relation optionnelle `ServicePackage?`

### Flux complet des offres

```
Vendeur → "Créer une offre" (dans la conversation)
       ↓
Formulaire modal : titre, description, montant, délai, révisions, expiration
       ↓
Offer créée (SENT) + message système dans le chat
       ↓
Client voit l'OfferCard avec boutons Accepter / Refuser
       ↓
  ┌─ Accepter ─→ Offer (ACCEPTED) + Order créée (PENDING_PAYMENT)
  │               + ORDER_THREAD créé + commission calculée
  └─ Refuser  ─→ Offer (REJECTED) + message système
```

### Server actions (`offer-actions.ts`)

| Action | Validation | Résultat |
|--------|------------|----------|
| `createOffer(conversationId, formData)` | Participant vendeur, conversation liée à un service, montant min 500 FCFA | Offer SENT + message système |
| `respondToOffer(offerId, 'accept')` | Destinataire = buyer, statut SENT, non expiré | Offer ACCEPTED + Order PENDING_PAYMENT + ORDER_THREAD |
| `respondToOffer(offerId, 'reject')` | Même validation | Offer REJECTED + message système |

### Calcul commission automatique

Lors de l'acceptation d'une offre :
1. Récupère la `CommissionRule` la plus récente (défaut 10% = 1000 bps)
2. Calcule `fee = subtotal × percentBps / 10000`
3. `totalMinor = subtotalMinor + platformFeeMinor`
4. Crée l'Order avec tous les montants et un `deliveryDueAt` basé sur l'offre

### Création de commande depuis offre

L'Order créée inclut :
- `offerId` → lien vers l'offre acceptée
- `serviceId` → depuis `conversation.serviceId`
- `servicePackageId` → `null` (offre personnalisée, pas de package catalogue)
- Un nouveau `Conversation` de type `ORDER_THREAD` est créé automatiquement (distinct de la conversation DIRECT)

### Composants

1. **`OfferCard`** — Carte riche affichant :
   - En-tête : "Offre de {vendeur}" + badge statut (En attente / Acceptée / Refusée / Expirée)
   - Corps : titre, description, montant, délai, révisions, date d'expiration
   - Actions : boutons Accepter/Refuser (buyer uniquement, si SENT et non expiré)
   - Lien vers la commande (si acceptée)
   - Notice "En attente de la réponse…" (seller)

2. **`OfferForm`** — Modal de création :
   - Champs : titre, description (opt.), montant, délai, révisions, expiration (7j défaut)
   - Note explicative sur le fonctionnement
   - Validation côté serveur

3. **`OfferPanel`** — Panneau récapitulatif des offres :
   - Affiché entre le header et les messages dans le ChatThread
   - Fetch les offres de la conversation
   - Rafraîchi automatiquement après création/réponse

### Intégration dans ChatThread

- **Header** : bouton "Créer une offre" visible uniquement si `iAmSeller && hasService`
- **OfferPanel** : inséré entre le header et le fil de messages
- **Messages système** : les événements d'offre (envoi, acceptation, refus) apparaissent dans le fil avec le texte réel du body
- **Refresh croisé** : après création/réponse à une offre, les messages ET le panel d'offres sont rafraîchis

### API route

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/conversations/[id]/offers` | GET | Liste des offres d'une conversation (avec infos vendeur, lien commande) |

---

## 4.43 — Commandes

### Modifications schéma Prisma

- Ajout modèle `OrderEvent` : `id`, `orderId`, `status`, `note`, `actorId`, `createdAt` — journal d'événements pour le timeline
- Ajout relation `events OrderEvent[]` sur `Order`

### Machine à états des commandes

```
PENDING_PAYMENT ─→ IN_PROGRESS (après paiement)
                ─→ CANCELLED   (par le buyer)

IN_PROGRESS     ─→ DELIVERED   (par le seller)

DELIVERED       ─→ COMPLETED           (buyer accepte)
                ─→ REVISION_REQUESTED  (buyer demande révision)

REVISION_REQUESTED ─→ IN_PROGRESS (seller reprend) ─→ DELIVERED ...

COMPLETED       ─→ (final)
CANCELLED       ─→ (final)
```

### Server actions (`order-actions.ts`)

| Action | Qui | Depuis | Vers | Validation |
|--------|-----|--------|------|------------|
| `createOrderFromPackage(formData)` | Buyer | — | PENDING_PAYMENT | Package publié, pas son propre service, commission calculée |
| `simulatePayment(orderId)` | Buyer | PENDING_PAYMENT | IN_PROGRESS | Placeholder pour Phase 4.45 (Chariow) |
| `deliverOrder(orderId, message?)` | Seller | IN_PROGRESS / REVISION_REQUESTED | DELIVERED | Message optionnel de livraison |
| `acceptDelivery(orderId)` | Buyer | DELIVERED | COMPLETED | Timestamp `completedAt` |
| `requestRevision(orderId, reason)` | Buyer | DELIVERED | REVISION_REQUESTED | Raison obligatoire, limite de révisions respectée |
| `cancelOrder(orderId)` | Buyer | PENDING_PAYMENT / PAID | CANCELLED | Timestamp `cancelledAt` |

### Calcul automatique de commission

Chaque création de commande (catalogue ou offre) :
1. Récupère la `CommissionRule` la plus récente (défaut 10%)
2. `platformFeeMinor = subtotalMinor × percentBps / 10000`
3. `totalMinor = subtotalMinor + platformFeeMinor`

### Gestion des révisions

- Nombre max de révisions depuis `servicePackage.revisions` ou `offer.revisions`
- Comptage via `OrderEvent` de type `REVISION_REQUESTED`
- Refus si toutes les révisions incluses sont utilisées

### Composants (`src/components/orders/`)

1. **`OrderTimeline`** — Timeline verticale avec icônes par statut, horodatage, notes
   - Chaque `OrderEvent` est un noeud avec dot coloré + connecteur
   - Accepte `Date | string` pour la compatibilité Prisma/JSON

2. **`OrderActions`** — Actions contextuelles selon statut et rôle :
   - Buyer PENDING_PAYMENT : Payer + Annuler
   - Buyer DELIVERED : Accepter + Demander révision (modal)
   - Seller IN_PROGRESS/REVISION_REQUESTED : Livrer (modal avec message)
   - Chaque action avec loading state et messages d'erreur

### Pages

| Route | Rôle | Description |
|-------|------|-------------|
| `.../client/commandes` | Buyer | Liste commandes avec statut, prix total, deadline |
| `.../client/commandes/[id]` | Buyer | Détail : service info + timeline + récapitulatif (total avec frais) + actions |
| `.../vendeur/commandes` | Seller | Liste avec compteur actives, prix hors commission |
| `.../vendeur/commandes/[id]` | Seller | Détail : buyer info + timeline + revenus (total - commission) + actions |

### Page détail commande — layout

```
┌─────────────────────────────┬──────────────┐
│ Service + vendeur/buyer     │ Récapitulatif│
│ Package/offre + brief       │ montants     │
│                             │              │
│ Timeline (OrderEvents)      │ Actions      │
│ • Commande créée            │ contextuelles│
│ • Paiement reçu             │              │
│ • Livraison effectuée       │              │
│ • ...                       │              │
└─────────────────────────────┴──────────────┘
```

### Commande directe depuis le catalogue

Le bouton "Commander" sur `/services/[slug]` est maintenant un `<form action={createOrderFromPackage}>` :
1. Vérifie l'authentification (redirige vers `/auth/connexion`)
2. Interdit de commander son propre service
3. Crée l'Order + OrderEvent initial
4. Redirige vers `/tableau-de-bord/client/commandes/{orderId}`

---

## 4.44 — Wallet / ledger / escrow

### Architecture financière interne

Trois couches de services métier, chacune avec une responsabilité claire :

#### 1. Ledger (`src/lib/ledger.ts`) — Comptabilité en partie double

Toute opération financière produit un **journal** contenant des **lignes** équilibrées (total débits = total crédits). Le système vérifie l'équilibre avant chaque écriture.

**Comptes systématiques :**
| Code | Rôle |
|------|------|
| `PLATFORM_CLEARING` | Argent entrant/sortant de la plateforme |
| `PLATFORM_COMMISSION` | Commissions encaissées |
| `ESCROW` | Fonds retenus en séquestre |
| `SELLER_PAYABLE_{userId}` | Montant dû au vendeur (créé dynamiquement) |

**Fonctions :**
- `getOrCreateAccount(code, ownerUserId?)` — trouve ou crée un compte
- `createJournalEntry(refType, refId, description, lines[])` — crée un journal équilibré (throw si déséquilibré)

#### 2. Escrow (`src/lib/escrow.ts`) — Machine à états du séquestre

| Fonction | Transition | Écritures ledger |
|----------|------------|-----------------|
| `holdEscrow(orderId)` | NONE → HELD | DEBIT clearing / CREDIT escrow |
| `releaseEscrow(orderId)` | HELD → RELEASED | DEBIT escrow / CREDIT commission + CREDIT seller payable |
| `freezeEscrow(orderId)` | HELD → FROZEN_DISPUTE | (pas d'écriture — gel conservatoire) |
| `refundEscrow(orderId)` | HELD/FROZEN → REFUNDED | DEBIT escrow / CREDIT clearing |

Au **release**, le wallet vendeur est crédité automatiquement (upsert `FinancialWallet.availableMinor`).

#### 3. Wallet (`src/lib/wallet.ts`) — Portefeuille vendeur

- `requestWithdrawal(formData)` — crée une demande de retrait si solde suffisant (min 1 000 FCFA), décrémente `availableMinor`
- Les retraits sont traités manuellement par l'admin (Phase 4.51)

### Intégration dans le cycle de vie des commandes

```
simulatePayment(orderId)
  └── holdEscrow(orderId)     ← fonds bloqués en séquestre
       └── Ledger: DEBIT clearing / CREDIT escrow

acceptDelivery(orderId)
  └── releaseEscrow(orderId)  ← fonds libérés au vendeur
       └── Ledger: DEBIT escrow / CREDIT commission + seller
       └── Wallet: availableMinor += subtotalMinor
```

Le `releaseEscrow` est appelé en **non-bloquant** (try/catch) dans `acceptDelivery` — si l'escrow échoue, la commande est quand même marquée COMPLETED et l'erreur est loguée pour réconciliation manuelle.

### Pages vendeur

| Route | Description |
|-------|-------------|
| `/tableau-de-bord/vendeur/revenus` | Dashboard revenus : 4 KPIs (disponible, séquestre, total gagné, en attente retrait) + liste fonds en séquestre actifs + historique commandes terminées |
| `/tableau-de-bord/vendeur/retraits` | Formulaire retrait (min 1000 FCFA) + historique des demandes (statut : En attente / Approuvé / Versé / Refusé) |
| `/api/wallet` | GET wallet data + withdrawals |

---

## Phase 4.45 — Paiements Chariow

### Stratégie d'intégration

Chariow est utilisé **comme acquéreur** uniquement (carte bancaire / mobile money). Il ne fournit ni escrow, ni wallet, ni split marketplace — ces fonctions sont gérées par notre couche financière interne (Phase 4.44).

L'intégration est **environment-aware** : quand `CHARIOW_API_KEY` est vide (dev), le flux redirige vers une page de simulation locale ; en production, il redirige vers la page de paiement Chariow.

### Architecture du flux de paiement

```
Acheteur clique "Payer"
  └── initiatePayment(orderId)                [server action]
       ├── Crée un Payment (status: PENDING)
       ├── Appelle Chariow Checkout API
       │     └── custom_metadata: { internal_order_id, internal_payment_id, buyer_id }
       └── redirect → checkout_url (Chariow ou simulation)

Chariow confirme le paiement
  └── POST /api/webhooks/chariow              [Pulse webhook]
       ├── Valide la signature (HMAC-SHA256)
       ├── Idempotence : skip si déjà SUCCEEDED/FAILED
       └── confirmPayment(paymentId)
            ├── Payment → SUCCEEDED
            ├── Order → IN_PROGRESS + événements PAID/IN_PROGRESS
            └── holdEscrow(orderId) → ledger + escrow state
```

### Fichiers créés

| Fichier | Rôle |
|---------|------|
| `src/lib/chariow.ts` | Client API Chariow : `createCheckoutSession()`, `getSaleStatus()`, `validateWebhookPayload()`, détection mode simulation |
| `src/lib/payment-actions.ts` | Server actions : `initiatePayment()` (crée Payment + redirige), `confirmPayment()` (idempotent, met à jour Payment/Order/Escrow), `failPayment()` |
| `src/app/api/webhooks/chariow/route.ts` | Handler POST pour les Pulses Chariow (`successful.sale`, `failed.sale`, `abandoned.sale`) |
| `src/app/paiement/simulation/page.tsx` | Page de simulation dev — simule un webhook `successful.sale` localement |
| `src/app/paiement/succes/page.tsx` | Page retour succès — message de confirmation + liens vers commande |
| `src/app/paiement/annule/page.tsx` | Page retour annulation — message + option de réessayer |

### Modifications

| Fichier | Modification |
|---------|-------------|
| `src/components/orders/order-actions.tsx` | Bouton "Payer" utilise maintenant `initiatePayment` (server action avec redirect) au lieu de `simulatePayment` |
| `src/lib/order-actions.ts` | `simulatePayment` supprimée — remplacée par le flux `payment-actions.ts` |
| `.env` / `.env.example` | Ajout des variables `CHARIOW_API_KEY`, `CHARIOW_API_URL`, `CHARIOW_PRODUCT_ID`, `CHARIOW_WEBHOOK_SECRET` |

### Webhook Chariow — gestion des événements

| Événement Pulse | Action |
|-----------------|--------|
| `successful.sale` | `confirmPayment()` → Payment SUCCEEDED, Order IN_PROGRESS, holdEscrow |
| `failed.sale` | `failPayment()` → Payment FAILED |
| `abandoned.sale` | `failPayment()` → Payment FAILED |

### Sécurité webhook

- Validation de signature HMAC-SHA256 via `x-chariow-signature` header
- Idempotence : Payment déjà SUCCEEDED/FAILED → skip
- Retourne 2xx rapidement (conformité Chariow retry policy : 1m → 5m → 30m → 2h → 24h)

### Configuration Chariow requise (production)

1. Créer un produit type **License** dans le dashboard Chariow (permet achats répétés)
2. Configurer l'URL webhook Pulse : `https://votre-domaine.com/api/webhooks/chariow`
3. Renseigner les variables d'environnement : `CHARIOW_API_KEY`, `CHARIOW_PRODUCT_ID`, `CHARIOW_WEBHOOK_SECRET`

### Routes ajoutées (total : 37)

| Route | Type |
|-------|------|
| `/api/webhooks/chariow` | API (POST) |
| `/paiement/simulation` | Page (statique) |
| `/paiement/succes` | Page (statique) |
| `/paiement/annule` | Page (statique) |

---

## Phase 4.46 — Notifications & E-mails

### Architecture

Le système de notifications repose sur trois couches :

1. **Service de notifications** (`src/lib/notifications.ts`) — dispatchers par événement, fire-and-forget, créent une notification in-app + déclenchent l'envoi d'email
2. **Service email** (`src/lib/email.ts`) — nodemailer + templates HTML responsive, skip gracieux si SMTP non configuré
3. **SSE temps réel** (`/api/notifications/stream`) — pousse les nouvelles notifications aux clients connectés via EventSource (fallback polling 15s si SSE échoue)

### E-mails transactionnels

| Template | Déclencheur | Destinataire |
|----------|------------|-------------|
| Commande créée | `createOrderFromPackage` / `respondToOffer` | Acheteur + Vendeur |
| Paiement confirmé | `confirmPayment` (webhook Chariow) | Acheteur + Vendeur |
| Commande livrée | `deliverOrder` | Acheteur |
| Commande terminée / fonds libérés | `acceptDelivery` | Vendeur |
| Révision demandée | `requestRevision` | Vendeur |
| Nouveau message | `sendMessage` | Destinataire |
| Offre personnalisée reçue | `createOffer` | Acheteur |
| Commande annulée | `cancelOrder` | Vendeur |

Tous les emails utilisent un layout HTML responsive avec :
- Palette de marque cohérente (primaire #4f46e5)
- Boutons CTA centrés avec liens deep dans l'application
- Texte de réassurance (séquestre, protection des fonds)
- Footer avec nom de l'application

### Notifications in-app

Chaque dispatcher crée une entrée dans la table `Notification` avec :
- `title` + `body` : texte concis en français simple
- `dataJson` : métadonnées structurées (`orderId`, `conversationId`, `link`)
- `channel: "in_app"` (séparé du canal email)

### SSE (Server-Sent Events)

`GET /api/notifications/stream` :
- Authentification via session Auth.js
- Pousse un `unread_count` initial à la connexion
- Polling DB toutes les 5s pour nouvelles notifications
- Événements : `notification` (nouvelle notif), `unread_count` (compteur)
- Keep-alive ping toutes les 30s
- Nettoyage propre à la déconnexion (abort signal)

**Amélioration V2** : remplacer le polling DB par pg LISTEN/NOTIFY ou Redis pub/sub.

### API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/notifications` | GET | Liste paginée (cursor) des notifications |
| `/api/notifications/read` | POST | Marquer comme lues : `{ ids: [...] }` ou `{ all: true }` |
| `/api/notifications/unread-count` | GET | Compteur de non-lues (fallback polling) |
| `/api/notifications/stream` | GET | Flux SSE temps réel |

### Composants UI

| Composant | Description |
|-----------|-------------|
| `NotificationBell` | Icône cloche dans le header avec badge compteur, dropdown dernières notifs, SSE auto-connect, marquer tout lu |
| Page notifications client | Centre de notifications complet : filtre tout/non-lues, chargement paginé, navigation vers l'objet lié |
| Page notifications vendeur | Réutilise la même page via re-export |

### Intégration dans les actions existantes

Tous les appels de notification sont **fire-and-forget** (`.catch(() => {})`) — ils ne bloquent jamais le flux principal ni ne provoquent d'erreur visible. Pattern appliqué dans :

- `src/lib/order-actions.ts` — 5 triggers (create, deliver, accept, revision, cancel)
- `src/lib/payment-actions.ts` — 1 trigger (confirm)
- `src/lib/messaging-actions.ts` — 1 trigger (send message)
- `src/lib/offer-actions.ts` — 1 trigger (create offer)

### Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `src/lib/email.ts` | **Créé** — nodemailer + 9 templates HTML |
| `src/lib/notifications.ts` | **Créé** — 8 dispatchers événementiels |
| `src/app/api/notifications/route.ts` | **Créé** — GET notifications paginées |
| `src/app/api/notifications/read/route.ts` | **Créé** — POST marquer lues |
| `src/app/api/notifications/unread-count/route.ts` | **Créé** — GET compteur |
| `src/app/api/notifications/stream/route.ts` | **Créé** — SSE stream |
| `src/components/notifications/notification-bell.tsx` | **Créé** — Cloche header + dropdown |
| `src/app/tableau-de-bord/client/notifications/page.tsx` | **Créé** — Centre notifications |
| `src/app/tableau-de-bord/vendeur/notifications/page.tsx` | **Créé** — Re-export |
| `src/components/layout/header.tsx` | **Modifié** — Ajout `NotificationBell` |
| `src/lib/order-actions.ts` | **Modifié** — 5 triggers notif |
| `src/lib/payment-actions.ts` | **Modifié** — 1 trigger notif |
| `src/lib/messaging-actions.ts` | **Modifié** — 1 trigger notif |
| `src/lib/offer-actions.ts` | **Modifié** — 1 trigger notif |

### Dépendance ajoutée

- `nodemailer@7` + `@types/nodemailer` (compatible avec next-auth peerOptional)

### Routes ajoutées (total : 43)

| Route | Type |
|-------|------|
| `/api/notifications` | API (GET) |
| `/api/notifications/read` | API (POST) |
| `/api/notifications/unread-count` | API (GET) |
| `/api/notifications/stream` | API (SSE) |
| `/tableau-de-bord/client/notifications` | Page |
| `/tableau-de-bord/vendeur/notifications` | Page |

---

## Phase 4.47 — Avis & Réputation

### Modèle de données

Le modèle `Review` a été enrichi :
- `sellerResponse String?` — réponse du vendeur à l'avis
- `sellerRespondedAt DateTime?` — date de la réponse
- Index ajouté sur `createdAt` pour les requêtes de tri

Contrainte existante `@@unique([orderId])` garantit un seul avis par commande.

### Logique métier

| Action | Condition | Résultat |
|--------|-----------|----------|
| `submitReview` | Buyer, COMPLETED, pas d'avis existant | Crée Review + notifie vendeur |
| `respondToReview` | Seller propriétaire, pas de réponse existante | Met à jour sellerResponse |
| `getSellerReputation` | Tout public | Moyenne, total, distribution 1-5 |

Validation :
- Note entre 1 et 5 (obligatoire)
- Commentaire optionnel (texte libre)
- Réponse vendeur max 1000 caractères, une seule par avis
- Notification `onReviewReceived` au vendeur (in-app, fire-and-forget)

### Calcul de réputation

`getSellerReputation(sellerUserId)` agrège tous les `Review` liés aux commandes du vendeur :

```typescript
{
  averageRating: 4.3,     // arrondi à 1 décimale
  totalReviews: 47,
  distribution: { 1: 1, 2: 2, 3: 5, 4: 15, 5: 24 }
}
```

### Composants UI

| Composant | Description |
|-----------|-------------|
| `StarRating` | Affichage/saisie étoiles (sm/md/lg), interactif ou lecture seule, affiche valeur et compteur |
| `ReviewCard` | Carte d'avis complète : avatar, nom, date relative, étoiles, commentaire, réponse vendeur |
| `ReviewForm` | Formulaire de soumission : sélection étoiles interactive + textarea + labels contextuels |
| `SellerResponseForm` | Bouton "Répondre" → textarea inline pour le vendeur |
| `ReputationSummary` | Vue agrégée : grande note, étoiles, barres de distribution horizontales |

### Intégrations

**Page commande client** (`/tableau-de-bord/client/commandes/[id]`)
- Si COMPLETED et pas d'avis → affiche `ReviewForm`
- Si avis existant → affiche `ReviewCard` (lecture seule)

**Page commande vendeur** (`/tableau-de-bord/vendeur/commandes/[id]`)
- Si avis existant → affiche `ReviewCard` + `SellerResponseForm` (si pas encore répondu)

**Page service publique** (`/services/[slug]`)
- Score vendeur affiché via `StarRating` dans le profil vendeur
- Section avis avec `ReputationSummary` (distribution) + 5 derniers `ReviewCard`
- Les reviews incluent maintenant nom + avatar de l'acheteur et réponse du vendeur

### API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/reviews` | GET | Reviews paginées (cursor) par `serviceId` ou `sellerUserId` |
| `/api/sellers/[id]/reputation` | GET | Score de réputation agrégé |

### Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `prisma/schema.prisma` | **Modifié** — Review + sellerResponse, sellerRespondedAt, index |
| `src/lib/review-actions.ts` | **Créé** — submitReview, respondToReview, getSellerReputation |
| `src/lib/notifications.ts` | **Modifié** — ajout onReviewReceived |
| `src/app/api/reviews/route.ts` | **Créé** — GET reviews paginées |
| `src/app/api/sellers/[id]/reputation/route.ts` | **Créé** — GET reputation |
| `src/components/reviews/star-rating.tsx` | **Créé** |
| `src/components/reviews/review-card.tsx` | **Créé** |
| `src/components/reviews/review-form.tsx` | **Créé** |
| `src/components/reviews/seller-response-form.tsx` | **Créé** |
| `src/components/reviews/reputation-summary.tsx` | **Créé** |
| `src/app/tableau-de-bord/client/commandes/[id]/page.tsx` | **Modifié** — section avis |
| `src/app/tableau-de-bord/vendeur/commandes/[id]/page.tsx` | **Modifié** — avis + réponse |
| `src/app/services/[slug]/page.tsx` | **Modifié** — avis complets + score vendeur |

### Routes ajoutées (total : 45)

| Route | Type |
|-------|------|
| `/api/reviews` | API (GET) |
| `/api/sellers/[id]/reputation` | API (GET) |

---

## Phase 4.48 — Litiges & Modération

### Modèle de données

**Nouveaux ajouts au schéma :**
- `DisputeResolution` enum : `REFUND_BUYER`, `RELEASE_SELLER`, `PARTIAL_REFUND`
- `DisputeMessage` model : fil de discussion dédié au litige (séparé de la messagerie)
- `Dispute` enrichi : `assignedToId`, `resolutionType`, `resolutionNote`, index sur `status` et `orderId`
- Relation `disputeMessages` ajoutée sur `User`

### Flux complet du litige

```
Acheteur clique "Ouvrir un litige" (IN_PROGRESS/DELIVERED/REVISION_REQUESTED)
  └── openDispute()
       ├── Crée Dispute (OPEN) + premier DisputeMessage
       ├── Order → DISPUTED + OrderEvent
       ├── freezeEscrow(orderId) → fonds gelés
       ├── AuditLog (DISPUTE_OPENED)
       └── Notifications buyer + seller

Support prend en charge
  └── takeDisputeUnderReview()
       ├── Dispute → UNDER_REVIEW, assignedToId = support
       └── DisputeMessage système

Support résout
  └── resolveDispute(resolutionType)
       ├── Dispute → RESOLVED + resolutionType + note
       ├── Order → COMPLETED (si RELEASE_SELLER) ou CANCELLED (si REFUND)
       ├── Escrow : releaseEscrow() ou refundEscrow() selon décision
       ├── AuditLog (DISPUTE_RESOLVED)
       └── Notifications buyer + seller
```

### Server actions

| Action | Qui | Description |
|--------|-----|-------------|
| `openDispute` | Buyer | Ouvre litige, gèle escrow, notifie, audit |
| `addDisputeMessage` | Buyer, Seller, Support | Ajoute message au fil (vérifie accès) |
| `takeDisputeUnderReview` | Support/Admin | Statut → UNDER_REVIEW, s'assigne |
| `resolveDispute` | Support/Admin | Résout avec REFUND_BUYER, RELEASE_SELLER ou PARTIAL_REFUND |

### Audit logging

Service `src/lib/audit.ts` créé — insère dans `AuditLog` de manière fire-and-forget :
- `DISPUTE_OPENED` : actorId, orderId, reason (tronqué)
- `DISPUTE_RESOLVED` : actorId, orderId, resolutionType, note

### Dashboard Admin/Support

| Route | Description |
|-------|-------------|
| `/tableau-de-bord/admin` | Redirige vers litiges |
| `/tableau-de-bord/admin/litiges` | Liste tous les litiges (4 KPIs : ouvert/examen/résolu/fermé) + liste triée |
| `/tableau-de-bord/admin/litiges/[id]` | Détail : motif, fil de discussion, infos commande, parties, actions |

Layout admin protégé : seuls les rôles `ADMIN` et `SUPPORT` ont accès.

### Composants UI

| Composant | Description |
|-----------|-------------|
| `DisputeThread` | Fil de discussion avec bulles (buyer/seller/support), messages système, saisie de réponse |
| `DisputeAdminActions` | Bouton "Prendre en charge" + modal "Résoudre" (sélection type, note, avertissement irréversibilité) |
| `OrderActions` modifié | Bouton "Ouvrir un litige" pour buyer (IN_PROGRESS/DELIVERED/REVISION_REQUESTED), modal avec avertissement |

### Intégration escrow

| Événement | Action escrow |
|-----------|---------------|
| Litige ouvert | `freezeEscrow(orderId)` — fonds gelés |
| Résolution REFUND_BUYER / PARTIAL_REFUND | `refundEscrow(orderId)` — fonds retournés |
| Résolution RELEASE_SELLER | `releaseEscrow(orderId)` — fonds libérés au vendeur |

### Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `prisma/schema.prisma` | **Modifié** — DisputeResolution enum, DisputeMessage model, Dispute enrichi, User relation |
| `src/lib/audit.ts` | **Créé** — Service audit log |
| `src/lib/dispute-actions.ts` | **Créé** — 4 server actions (open, message, review, resolve) |
| `src/lib/notifications.ts` | **Modifié** — ajout onDisputeOpened, onDisputeResolved |
| `src/components/disputes/dispute-thread.tsx` | **Créé** — Fil de discussion |
| `src/components/disputes/dispute-admin-actions.tsx` | **Créé** — Actions admin |
| `src/components/orders/order-actions.tsx` | **Modifié** — bouton + modal litige |
| `src/app/tableau-de-bord/admin/layout.tsx` | **Créé** — Auth gate ADMIN/SUPPORT |
| `src/app/tableau-de-bord/admin/page.tsx` | **Créé** — Redirect litiges |
| `src/app/tableau-de-bord/admin/litiges/page.tsx` | **Créé** — Liste litiges |
| `src/app/tableau-de-bord/admin/litiges/[id]/page.tsx` | **Créé** — Détail litige |

### Routes ajoutées (total : 48)

| Route | Type |
|-------|------|
| `/tableau-de-bord/admin` | Page (redirect) |
| `/tableau-de-bord/admin/litiges` | Page (dynamique) |
| `/tableau-de-bord/admin/litiges/[id]` | Page (dynamique) |

---

---

## Phase 4.49 — Admin Dashboard Complet

### Résumé

Mise en place du tableau de bord d'administration complet de la plateforme : vue d'ensemble avec KPIs globaux, gestion des utilisateurs (activation/suspension), modération des services (publication/archivage), traitement des demandes de retrait (approbation/rejet/versement), et console de journal d'audit paginée avec filtres par action.

### Modifications Prisma

- **`AuditLog`** : ajout de la relation `actor` vers `User` (`@relation("AuditActor")`), index sur `actorId`.
- **`User`** : ajout de la relation inverse `auditLogs AuditLog[] @relation("AuditActor")`.

### Architecture

```
src/lib/admin-actions.ts          # 6 server actions admin protégées
src/components/admin/             # 3 composants client d'actions admin
src/app/tableau-de-bord/admin/
  ├── layout.tsx                  # Layout enrichi avec sidebar admin
  ├── page.tsx                    # Dashboard KPIs (remplace le redirect)
  ├── utilisateurs/page.tsx       # Gestion utilisateurs
  ├── services/page.tsx           # Modération services
  ├── retraits/page.tsx           # Approbation retraits
  └── audit/page.tsx              # Console journal d'audit
```

### Server actions (`admin-actions.ts`)

| Action | Rôle requis | Description |
|--------|-------------|-------------|
| `suspendUser(userId)` | ADMIN/SUPPORT | Suspend un utilisateur (locale → "suspended") |
| `activateUser(userId)` | ADMIN/SUPPORT | Réactive un utilisateur |
| `publishService(serviceId)` | ADMIN/SUPPORT | Publie un service (status → PUBLISHED) |
| `archiveService(serviceId)` | ADMIN/SUPPORT | Archive un service (status → ARCHIVED) |
| `approveWithdrawal(withdrawalId)` | ADMIN/SUPPORT | Approuve un retrait (REQUESTED → APPROVED) |
| `rejectWithdrawal(withdrawalId)` | ADMIN/SUPPORT | Refuse un retrait + recrédite le wallet |
| `markWithdrawalPaid(withdrawalId, payoutRef)` | ADMIN/SUPPORT | Marque un retrait comme versé (APPROVED → PAID) |

Toutes les actions sont protégées par `requireAdmin()` et logguées dans l'audit trail.

### Composants client

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `UserAdminActions` | `components/admin/user-admin-actions.tsx` | Boutons Suspendre/Activer par utilisateur |
| `ServiceAdminActions` | `components/admin/service-admin-actions.tsx` | Boutons Publier/Archiver par service |
| `WithdrawalAdminActions` | `components/admin/withdrawal-admin-actions.tsx` | Boutons Approuver/Refuser/Marquer versé + modal payout |

### Pages admin

| Page | Route | KPIs / Fonctionnalités |
|------|-------|------------------------|
| **Aperçu** | `/tableau-de-bord/admin` | 8 KPIs : utilisateurs, vendeurs, services publiés, commandes totales/actives, litiges ouverts, retraits en attente, revenus plateforme + dernières commandes |
| **Utilisateurs** | `/tableau-de-bord/admin/utilisateurs` | Tableau complet : avatar, nom, email, rôles, commandes, date inscription, statut, actions |
| **Services** | `/tableau-de-bord/admin/services` | Liste avec vendeur, catégorie, prix, nb commandes, statut, actions de modération |
| **Retraits** | `/tableau-de-bord/admin/retraits` | Liste avec vendeur, montant, statut, actions contextuelles selon état |
| **Audit** | `/tableau-de-bord/admin/audit` | Journal paginé (40/page), filtres par type d'action, date/heure, acteur, entité, payload JSON |

### Navigation admin (sidebar)

6 items : Aperçu, Utilisateurs, Services, Litiges, Retraits, Journal d'audit.

### Nouvelles routes

| Route | Type |
|-------|------|
| `/tableau-de-bord/admin` | Page (KPIs dashboard) |
| `/tableau-de-bord/admin/utilisateurs` | Page (dynamique) |
| `/tableau-de-bord/admin/services` | Page (dynamique) |
| `/tableau-de-bord/admin/retraits` | Page (dynamique) |
| `/tableau-de-bord/admin/audit` | Page (dynamique) |

### Décisions techniques

1. **Suspension via `locale` field** — approche pragmatique sans ajout de colonne, le middleware d'auth peut vérifier `locale === "suspended"`.
2. **Rejet de retrait → recrédite le wallet** — transaction atomique pour garantir la cohérence financière.
3. **Audit systématique** — toute action admin est tracée avec acteur, entité, et payload JSON pour la compliance.
4. **Filtres audit par URL** — `searchParams` pour la pagination et le filtrage, sans état client.

---

---

## Phase 4.50 — Recherche avancée & Filtres

### Résumé

Refonte complète du système de recherche de la plateforme : moteur de recherche multi-critères avec champs dénormalisés pour le tri et le filtrage performant, 6 composants de recherche réutilisables, barre de recherche enrichie dans le header, et page de résultats avec sidebar de filtres, tri, pagination, et cartes enrichies.

### Modifications Prisma

Ajout de 4 champs dénormalisés au modèle `Service` pour le tri et le filtrage sans jointures :

```prisma
avgRating        Float   @default(0)     // Note moyenne (0–5)
reviewCount      Int     @default(0)     // Nombre d'avis
minPriceMinor    BigInt?                 // Prix minimum depuis packages
minDeliveryDays  Int?                    // Délai minimum depuis packages
```

Ajout de 3 index composites :
- `@@index([status, avgRating])` — tri par note
- `@@index([status, minPriceMinor])` — tri par prix
- `@@index([status, createdAt])` — tri par date

### Architecture

```
src/lib/search.ts                         # Moteur de recherche + sync dénormalisée
src/components/search/
  ├── search-bar.tsx                      # Barre de recherche (header) avec suggestions
  ├── search-filters.tsx                  # Sidebar filtres (catégorie, budget, note, délai)
  ├── search-sort.tsx                     # Sélecteur de tri (6 options)
  ├── search-active-filters.tsx           # Chips de filtres actifs
  ├── search-pagination.tsx               # Pagination numérotée
  ├── mobile-filter-toggle.tsx            # Drawer filtres mobile
  └── service-result-card.tsx             # Carte résultat enrichie
```

### Moteur de recherche (`search.ts`)

| Fonctionnalité | Détails |
|----------------|---------|
| **Recherche textuelle** | `contains` insensible à la casse sur `title`, `summary`, et tags |
| **Filtre catégorie** | Par catégorie ou sous-catégorie (inclut les enfants) |
| **Filtre budget** | `priceMin` / `priceMax` sur `minPriceMinor` |
| **Filtre note** | `minRating` sur `avgRating` |
| **Filtre délai** | `maxDelivery` sur `minDeliveryDays` |
| **Facettes catégories** | Agrégation SQL avec compteurs par catégorie |
| **Fourchette prix** | Agrégation min/max des prix publiés |
| **Pagination** | 24 résultats/page, offset-based |

### Options de tri

| Clé | Critère |
|-----|---------|
| *(défaut)* | Featured → Note → Date |
| `popular` | Nombre de commandes |
| `rating` | Note moyenne |
| `newest` | Date de création |
| `price_asc` | Prix croissant |
| `price_desc` | Prix décroissant |

### Synchronisation dénormalisée

`syncServiceSearchFields(serviceId)` recalcule `avgRating`, `reviewCount`, `minPriceMinor` et `minDeliveryDays` à partir des données réelles. Appelée en fire-and-forget après :
- Soumission d'un avis (`review-actions.ts`)
- Création d'un service (`service-actions.ts`)

### Composants

| Composant | Fonctionnalité |
|-----------|----------------|
| `SearchBar` | Barre de recherche client avec clear, focus ring, dropdown de suggestions populaires |
| `SearchFilters` | Sidebar : catégories avec compteurs, inputs budget, étoiles note min, chips délai |
| `SearchSort` | Select dropdown avec 6 options de tri |
| `SearchActiveFilters` | Chips cliquables des filtres actifs avec suppression individuelle + reset global |
| `SearchPagination` | Pagination numérotée avec ellipses, prev/next, état pending |
| `MobileFilterToggle` | Bouton + drawer overlay pour filtres sur mobile |
| `ServiceResultCard` | Carte enrichie : avatar vendeur (vérifié), titre, note + étoiles, délai, commandes, catégorie, prix |

### Page `/recherche` refondue

- Barre de recherche pleine largeur en haut
- Sidebar fixe (desktop) / drawer (mobile) avec tous les filtres
- Barre d'outils : compteur résultats, tri, filtres actifs
- Grille responsive : 1 col mobile, 2 col tablette, 3 col desktop
- Pagination numérotée en bas
- État vide avec reset

### URL de recherche

```
/recherche?q=design&cat=graphisme&priceMin=5000&priceMax=50000&minRating=4&maxDelivery=7&sort=rating&page=2
```

Tous les paramètres sont optionnels. Le changement de filtre reset la page à 1.

### Décisions techniques

1. **Champs dénormalisés** — Pattern classique marketplace : `avgRating`, `reviewCount`, `minPriceMinor`, `minDeliveryDays` évitent les sous-requêtes coûteuses en lecture.
2. **Facettes SQL brutes** — `$queryRaw` pour l'agrégation catégories, plus performant que multiple `count()`.
3. **URL-based state** — Tous les filtres dans les `searchParams`, partageables et bookmarkables.
4. **Suggestions statiques** — Les recherches populaires sont en dur pour la V1, pourront être dynamiques via analytique en V2.

---

---

## Phase 4.51 — Page d'accueil complète

### Résumé

Réécriture complète de la page d'accueil `/` : passage de données statiques en dur à des données 100% dynamiques depuis la BDD. Nouveau design avec 7 sections distinctes, responsive mobile-first, palette professionnelle, et intégration des données réelles (services, catégories, vendeurs, statistiques plateforme).

### Architecture

La page est un Server Component unique (`src/app/page.tsx`) qui exécute 4 requêtes Prisma parallèles au rendu :

```
categories       → Catégories racines + compteur de services
popularServices  → 8 services les mieux notés (avgRating, reviewCount)
topSellers       → 6 vendeurs actifs avec réputation agrégée
stats            → Compteurs globaux (users, services, orders)
```

### Sections de la page

| # | Section | Description | Données |
|---|---------|-------------|---------|
| 1 | **Hero** | Gradient primary sombre, accroche dorée, barre de recherche pleine largeur, tags populaires cliquables, badge plateforme | Statique |
| 2 | **Stats banner** | Bandeau horizontal : utilisateurs, services publiés, commandes réalisées | `prisma.user.count()` + `service.count()` + `order.count()` |
| 3 | **Catégories** | Grille 2→5 colonnes avec icônes, noms et compteurs de services | `prisma.category.findMany()` avec `_count` |
| 4 | **Services populaires** | Grille 1→4 colonnes, cartes enrichies (avatar, titre, note/étoiles, délai, prix) | `prisma.service.findMany()` triés par `avgRating` |
| 5 | **Comment ça marche** | 4 étapes illustrées (Chercher, Contacter, Payer, Recevoir) avec icônes Lucide | Statique |
| 6 | **Vendeurs vedettes** | Grille 2→6 colonnes, avatar, nom, headline, note, pays | `prisma.sellerProfile.findMany()` avec calcul de réputation |
| 7 | **Confiance & sécurité** | 4 cards colorées (Paiement sécurisé, Vendeurs vérifiés, Livraison suivie, Support réactif) | Statique |
| 8 | **Double CTA** | 2 cards côte à côte : "Trouver un prestataire" (dark) + "Devenir vendeur" (primary) | Statique |

### Design

- **Hero** : gradient `primary-600` → `primary-900` avec motif SVG subtil, texte blanc, accroche dorée (`yellow-300` → `orange-300`), barre de recherche blanche avec shadow-2xl
- **Responsive** : mobile-first, grilles adaptatives sur toutes les sections
- **Cartes services** : avatar vendeur vérifié, titre 2 lignes, note étoile, délai, prix minimum
- **Vendeurs** : avatars lg, headline, note agrégée multi-services, drapeau pays
- **CTA** : 2 cards arrondies avec gradients distincts et shapes décoratives

### Décisions techniques

1. **Données 100% dynamiques** — Plus aucune donnée en dur, tout vient de la BDD via `Promise.all` pour le parallélisme.
2. **Réputation vendeur agrégée** — Calculée côté serveur à partir des `avgRating`/`reviewCount` de chaque service du vendeur (moyenne pondérée).
3. **`force-dynamic`** — La page est marquée dynamique pour toujours afficher les données fraîches (pas de cache statique).
4. **Tags populaires** — Liens directs vers `/recherche?q=...` pour les recherches courantes.

---

---

## Phase 4.52 — SEO, Métadonnées & Performance

### Résumé

Mise en place complète du SEO technique et de l'optimisation des performances perçues : métadonnées Open Graph dynamiques sur toutes les pages publiques, données structurées JSON-LD (Organization, WebSite SearchAction, Service, BreadcrumbList), sitemap.xml dynamique, robots.txt, skeletons de chargement, et méta-configuration globale.

### Architecture

```
src/lib/jsonld.ts                          # Générateurs JSON-LD réutilisables
src/app/layout.tsx                         # Métadonnées OG globales + metadataBase
src/app/sitemap.ts                         # Sitemap dynamique (services + catégories)
src/app/robots.ts                          # Directives robots.txt
src/app/loading.tsx                        # Skeleton page d'accueil
src/app/recherche/loading.tsx              # Skeleton page recherche
src/app/services/[slug]/loading.tsx        # Skeleton page service
```

### Métadonnées Open Graph

| Page | Type OG | Champs dynamiques |
|------|---------|-------------------|
| Layout racine | `website` | Titre, description, siteName, locale, canonical, twitter card |
| `/services/[slug]` | `website` | `generateMetadata` — titre service, description (summary tronqué), seller name, canonical, twitter |
| `/recherche` | — | `generateMetadata` — titre adaptatif (`Résultats pour « X »`), noindex si recherche active |

### JSON-LD structuré (`jsonld.ts`)

| Fonction | Schema.org type | Placement |
|----------|----------------|-----------|
| `organizationJsonLd()` | `Organization` | Page d'accueil |
| `websiteSearchJsonLd()` | `WebSite` + `SearchAction` | Page d'accueil — active le Sitelinks Search Box Google |
| `serviceJsonLd(opts)` | `Service` + `AggregateRating` + `Offer` | Page service détail |
| `breadcrumbJsonLd(items)` | `BreadcrumbList` | Page service détail |

### Sitemap XML dynamique

Route `ƒ /sitemap.xml` — `force-dynamic`, génère :
- Pages statiques : `/`, `/services`, `/recherche`, `/auth/*` avec priorités différenciées
- Pages catégories : `/recherche?cat={slug}` pour chaque catégorie racine
- Pages services : `/services/{slug}` avec `lastModified` depuis `updatedAt`

### robots.txt

Route `○ /robots.txt` — statique :
- `Allow: /` pour tous les bots
- `Disallow: /tableau-de-bord/`, `/api/`, `/paiement/simulation`
- Référence vers `/sitemap.xml`

### Skeletons de chargement (Streaming SSR)

| Fichier | Page | Éléments simulés |
|---------|------|------------------|
| `loading.tsx` (racine) | Accueil | Hero gradient + grille catégories |
| `recherche/loading.tsx` | Recherche | Barre recherche + sidebar filtres + grille 6 cartes |
| `services/[slug]/loading.tsx` | Service détail | Breadcrumb + image + avatar + titre + sidebar package |

### Configuration globale améliorée

- `metadataBase` défini sur `NEXT_PUBLIC_APP_URL` — résolution automatique des URLs relatives dans les OG tags
- `robots` global : index/follow + googleBot avec `max-snippet: -1` et `max-image-preview: large`
- `alternates.canonical` sur toutes les pages publiques
- Font Inter avec `display: swap` et `variable: --font-inter` (déjà en place)

### Décisions techniques

1. **`generateMetadata` séparé de la page** — Next.js déduplique les requêtes Prisma, pas de double fetch.
2. **Sitemap `force-dynamic`** — Nécessaire car la requête Prisma a besoin de la BDD au runtime.
3. **`noindex` sur les recherches avec requête** — Évite l'indexation de pages quasi-infinies de résultats filtrés.
4. **JSON-LD via `dangerouslySetInnerHTML`** — Pattern recommandé par Next.js pour les scripts LD+JSON.
5. **Skeletons fidèles** — Chaque skeleton reproduit la structure exacte de la page pour limiter le CLS.

---

---

## Phase 4.53 — Pages statiques & Aide

### Résumé

Création de l'ensemble des pages statiques et d'aide référencées dans le footer : pages légales (CGU, Confidentialité, À propos), centre d'aide (FAQ structurée, guide client, guide vendeur), et page contact avec formulaire et envoi d'e-mail. Installation de `@tailwindcss/typography` pour le rendu des contenus prose.

### Architecture

```
src/components/layout/static-page-layout.tsx   # Layout réutilisable (titre, prose)
src/components/help/
  ├── faq-accordion.tsx                        # Accordéon animé (client)
  └── contact-form.tsx                         # Formulaire contact (client)
src/lib/contact-actions.ts                     # Server action envoi formulaire
src/app/
  ├── conditions/page.tsx                      # CGU (11 articles)
  ├── confidentialite/page.tsx                 # Politique de confidentialité (9 sections)
  ├── a-propos/page.tsx                        # Page À propos (mission, valeurs, CTA)
  ├── contact/page.tsx                         # Page contact (canaux + formulaire)
  └── aide/
      ├── faq/page.tsx                         # FAQ (4 catégories, 14 questions)
      ├── guide-client/page.tsx                # Guide client (6 étapes)
      └── guide-vendeur/page.tsx               # Guide vendeur (6 étapes + conseils)
```

### Pages créées

| Route | Type | Contenu |
|-------|------|---------|
| `/conditions` | Statique | CGU complètes — 11 articles : objet, inscription, services, commandes/paiements, livraison, litiges, PI, responsabilité, données, modifications, contact |
| `/confidentialite` | Statique | Politique de confidentialité — 9 sections : responsable, données collectées, finalités, partage, conservation, sécurité, droits, cookies, modifications |
| `/a-propos` | Statique | Page À propos — mission, publics cibles, 4 valeurs (Afrique, confiance, simplicité, performance), CTA inscription |
| `/aide/faq` | Statique | FAQ — 4 catégories (Général, Clients, Vendeurs, Paiements & litiges), 14 questions avec accordéons animés |
| `/aide/guide-client` | Statique | Guide en 6 étapes illustrées : chercher, contacter, commander, recevoir, litige, avis |
| `/aide/guide-vendeur` | Statique | Guide en 6 étapes + 5 conseils de réussite : inscription, publication, commandes, communication, paiement, réputation |
| `/contact` | Statique | 3 canaux (email, messagerie, délai) + formulaire complet (nom, email, sujet dropdown, message) |

### Composants

| Composant | Type | Description |
|-----------|------|-------------|
| `StaticPageLayout` | Server | Layout réutilisable : titre, sous-titre, conteneur prose max-w-3xl |
| `FaqAccordion` | Client | Accordéon avec chevron animé, transition max-height |
| `ContactForm` | Client | Formulaire 4 champs, dropdown sujets, validation, état de succès |

### Server action contact (`contact-actions.ts`)

- Validation : tous les champs requis, message 10–5000 caractères
- Envoie un e-mail à `CONTACT_EMAIL` ou `EMAIL_FROM` via le service email existant
- Template HTML avec les données du formulaire (échappées)
- Fire-and-forget (pas de blocage si SMTP non configuré)

### Dépendances ajoutées

- `@tailwindcss/typography` — plugin Tailwind pour les classes `prose`, importé via `@plugin` dans `globals.css`

### Exports ajoutés (`email.ts`)

- `baseLayout` (alias de `layout`) — pour réutiliser le template email dans d'autres modules
- `sendMail` (alias de `send`) — pour envoyer des e-mails depuis d'autres server actions

### Décisions techniques

1. **Contenu en dur, pas de CMS** — pour la V1, le contenu statique est directement dans les composants React. Pas de complexité CMS à ce stade.
2. **Pages pré-rendues** — toutes les 7 pages sont `○ Static`, rendues au build pour des performances optimales.
3. **`prose` pour le contenu légal** — Tailwind Typography gère automatiquement la typographie, l'espacement et la hiérarchie des titres.
4. **`not-prose` pour les composants custom** — utilisé dans la FAQ et les guides pour sortir du style prose sur les composants interactifs.

---

---

## Phase 4.54 — Seed de données & Script de démonstration

### Résumé

Le script de seed (`prisma/seed.ts`) a été entièrement réécrit pour créer un jeu de données de démonstration complet. La plateforme est maintenant fonctionnelle dès le premier `npm run db:seed`, avec des comptes utilisateurs, des services publiés, des commandes terminées, des avis clients, et des données financières réalistes.

### Données créées par le seed

| Entité | Quantité | Détails |
|--------|----------|---------|
| Catégories | 9 parents + 28 enfants = **37** | Hiérarchie complète avec slugs et noms FR/EN |
| Règle de commission | **1** | 10% (1000 bps) par défaut |
| Admin | **1** | `admin@demo.com` avec rôle ADMIN |
| Vendeurs | **6** | Profils complets (bio, pays, ville, badge vérifié) + wallet initialisé |
| Acheteurs | **4** | Profils avec pays aléatoire |
| Services | **14** | Publiés, 3 forfaits chacun (BASIC/STANDARD/PREMIUM), 2 FAQ par service |
| Commandes terminées | **~42-70** | Status COMPLETED, avec événements chronologiques (5 étapes) |
| Commandes actives | **4** | Status IN_PROGRESS, avec date de livraison future |
| Avis clients | **~34-56** | Notes 3-5 étoiles, commentaires variés, réponses vendeur (60%) |
| Wallets vendeurs | **6** | Soldes aléatoires en XOF (50K-500K disponible) |

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | `admin@demo.com` | `Demo1234!` |
| Vendeur | `koffi@demo.com` | `Demo1234!` |
| Vendeur | `aminata@demo.com` | `Demo1234!` |
| Vendeur | `moussa@demo.com` | `Demo1234!` |
| Vendeur | `fatou@demo.com` | `Demo1234!` |
| Vendeur | `ibrahim@demo.com` | `Demo1234!` |
| Vendeur | `awa@demo.com` | `Demo1234!` |
| Client | `jean@demo.com` | `Demo1234!` |
| Client | `marie@demo.com` | `Demo1234!` |
| Client | `paul@demo.com` | `Demo1234!` |
| Client | `aicha@demo.com` | `Demo1234!` |

### Caractéristiques techniques

- **Idempotent** — utilise `upsert` + `findFirst` pour éviter les doublons en cas de ré-exécution
- **Synchronisation dénormalisée** — recalcule `avgRating`, `reviewCount`, `minPriceMinor`, `minDeliveryDays` pour chaque service via `aggregate`
- **Données chronologiques** — chaque commande a une timeline réaliste (création → paiement → en cours → livraison → terminée) répartie sur les 5-90 derniers jours
- **Commission calculée** — `platformFeeMinor` = 10% du `subtotalMinor` pour chaque commande
- **Hash bcrypt** — un seul hash partagé pour tous les comptes de démo (optimise la vitesse du seed)

### Commande d'exécution

```bash
npm run db:seed     # Exécute prisma/seed.ts via tsx
```

Prérequis : la base de données doit être migrée (`npm run db:push` ou `npm run db:migrate`).

---

---

## Phase 4.55 — Tests unitaires & Smoke tests

### Résumé

Mise en place d'une infrastructure de tests complète avec Vitest. 87 tests unitaires et d'intégration couvrant les modules critiques de la plateforme : utilitaires, données structurées SEO, grand livre comptable, machine à états escrow, et l'ensemble des server actions (contact, avis, modération admin).

### Infrastructure

| Élément | Détails |
|---------|---------|
| Framework | **Vitest 4.1.3** |
| Coverage | **@vitest/coverage-v8** |
| Résolution | Alias `@/` → `./src/*` (identique au projet) |
| Environnement | `node` (pas de DOM nécessaire pour la logique métier) |

### Mocks créés (`src/lib/__mocks__/`)

| Fichier | Rôle |
|---------|------|
| `prisma.ts` | Mock complet de PrismaClient (toutes les opérations CRUD par modèle) |
| `auth.ts` | Mock de `auth()` (session utilisateur configurable) |
| `email.ts` | Mock de `sendMail` + `baseLayout` |
| `notifications.ts` | Mock des fonctions de notification |
| `audit.ts` | Mock de `audit.log` |
| `search.ts` | Mock de `syncServiceSearchFields` |

### Fichiers de tests (8 suites, 87 tests)

| Fichier | Tests | Ce qui est couvert |
|---------|-------|--------------------|
| `utils.test.ts` | 14 | `cn` (merge Tailwind), `formatPrice` (XOF/EUR, bigint), `formatDate`, `slugify` (accents, caractères spéciaux) |
| `constants.test.ts` | 5 | Labels et couleurs pour chaque statut de commande, icônes catégories, constantes par défaut |
| `jsonld.test.ts` | 11 | Schema.org Organization, Service (avec/sans rating/offre), BreadcrumbList, WebSite SearchAction |
| `ledger.test.ts` | 6 | Codes de comptes, `getOrCreateAccount` (existant/nouveau), `createJournalEntry` (équilibre débit/crédit, rejet si déséquilibré) |
| `escrow.test.ts` | 9 | `holdEscrow` (idempotent, création), `releaseEscrow` (validations, crédit wallet), `freezeEscrow`, `refundEscrow` (HELD et FROZEN_DISPUTE) |
| `contact-actions.test.ts` | 7 | Validation champs, longueur message, envoi email, protection XSS (échappement HTML) |
| `review-actions.test.ts` | 13 | Auth, `submitReview` (7 cas : auth, note invalide, commande introuvable, non-acheteur, non-terminée, doublon, succès), `respondToReview` (5 cas), `getSellerReputation` (calcul moyenne, distribution) |
| `admin-actions.test.ts` | 22 | RBAC (anon, CLIENT, ADMIN, SUPPORT), `suspendUser`, `activateUser`, `publishService`, `archiveService`, `approveWithdrawal`, `rejectWithdrawal` (re-crédit wallet), `markWithdrawalPaid` (vérification statut) |

### Couverture des parcours critiques testés

1. **Contrôle d'accès** — vérification que seuls ADMIN/SUPPORT accèdent aux actions admin
2. **Validation d'entrée** — champs vides, limites min/max, formats invalides
3. **Machine à états escrow** — transitions valides (HELD → RELEASED, HELD → FROZEN, HELD/FROZEN → REFUNDED) et rejet des transitions invalides
4. **Équilibre comptable** — le ledger rejette toute écriture déséquilibrée (débit ≠ crédit)
5. **Protection XSS** — échappement HTML dans les formulaires de contact
6. **Idempotence** — le hold escrow ne duplique pas les états existants

### Scripts npm

```bash
npm test              # vitest run (CI, exit code)
npm run test:watch    # vitest (mode interactif)
npm run test:coverage # vitest run --coverage
```

### Décisions techniques

1. **Vitest plutôt que Jest** — natif ESM, résolution de modules bundler-compatible, pas de configuration Babel nécessaire.
2. **Mocks manuels** — chaque dépendance externe (Prisma, Auth, Email) a un mock dédié dans `__mocks__/` pour un contrôle total des réponses.
3. **Pas de tests React/DOM** — la logique métier est dans `src/lib/`, testable côté Node sans JSDOM. Les composants UI seront testés avec Playwright en phase ultérieure si nécessaire.
4. **Tests indépendants de l'environnement** — les tests JSON-LD utilisent des assertions structurelles (regex sur les chemins) plutôt que des URLs hardcodées.

---

---

## Phase 4.56 — Footer global & Navigation finale

### Résumé

Refonte complète du footer (dark, dynamique, avec catégories et CTA), amélioration du header (dropdown catégories, navigation desktop, mobile menu structuré), et création d'un composant Breadcrumbs réutilisable intégré dans 9 pages publiques.

### Footer (`components/layout/footer.tsx`)

**Avant :** Footer statique blanc avec 3 colonnes de liens et copyright.

**Après :** Footer dark (`bg-gray-900`) avec 5 colonnes :

| Colonne | Contenu |
|---------|---------|
| **Brand** | Logo, tagline, 4 icônes sociales (Facebook, Twitter, LinkedIn, Instagram) |
| **Catégories** | 9 catégories parentes chargées dynamiquement depuis la DB, avec icônes emoji |
| **Plateforme** | Services, Devenir vendeur, Comment ça marche, Rechercher |
| **Aide** | Guide client, Guide vendeur, FAQ, Nous contacter |
| **Légal** | CGU, Confidentialité, À propos |

Ajouts :
- **Bandeau CTA** — "Prêt à démarrer ?" avec boutons Créer un compte / Devenir vendeur
- **Barre de confiance** — icônes paiement sécurisé, support réactif, drapeaux pays cibles
- **Server Component async** — fetch des catégories avec `try/catch` pour graceful degradation au build

### Header (`components/layout/header.tsx`)

**Améliorations :**
- **Dropdown catégories** (desktop) — bouton "Catégories" avec icône `Grid3X3`, menu 9 catégories avec emojis + lien "Voir toutes"
- **Navigation desktop** — liens Catégories (dropdown) + Services
- **User dropdown enrichi** — ajout liens FAQ et Guide dans le menu utilisateur connecté
- **Mobile menu restructuré** — 3 sections avec labels : Catégories (grille 2 colonnes, top 6), Aide (4 liens avec icônes), Auth
- **Auto-fermeture** — tous les menus se ferment au changement de route (`useEffect` sur `pathname`)
- **Click outside** — fermeture du dropdown catégories au clic externe

### Breadcrumbs (`components/layout/breadcrumbs.tsx`)

Composant Server réutilisable :
- Icône Home pour l'accueil
- Séparateurs `ChevronRight`
- Dernier élément en `font-medium text-gray-900` (non-cliquable)
- `truncate` + `max-w-[200px]` sur chaque segment
- `overflow-x-auto` + `whitespace-nowrap` pour le scroll horizontal mobile
- Accessibilité : `<nav aria-label="Fil d'Ariane">`

### Intégration Breadcrumbs

| Page | Breadcrumbs |
|------|-------------|
| `/services/[slug]` | Accueil → Services → (Catégorie parent) → Catégorie → Titre service |
| `/recherche` | Accueil → Services → (Catégorie si filtrée) → Recherche / query |
| `/aide/faq` | Accueil → Aide → FAQ |
| `/aide/guide-client` | Accueil → Aide → Guide client |
| `/aide/guide-vendeur` | Accueil → Aide → Guide vendeur |
| `/conditions` | Accueil → Conditions d'utilisation |
| `/confidentialite` | Accueil → Confidentialité |
| `/a-propos` | Accueil → À propos |
| `/contact` | Accueil → Nous contacter |

Le `StaticPageLayout` accepte maintenant une prop `breadcrumbs?: BreadcrumbItem[]` optionnelle.

### Décisions techniques

1. **Footer Server Component** — permet le fetch DB pour les catégories dynamiques ; `try/catch` renvoie `[]` au build (pas de DB disponible).
2. **Catégories hardcodées dans le Header** — le header est un Client Component (`useSession`), la liste statique évite un fetch supplémentaire ; les 9 catégories sont synchronisées avec le seed.
3. **Breadcrumbs découplés du JSON-LD** — les breadcrumbs visuels (composant React) et les breadcrumbs structurés (JSON-LD dans `jsonld.ts`) sont indépendants pour une flexibilité maximale.
4. **Auto-fermeture des menus** — `useEffect` sur `pathname` garantit que la navigation mobile et les dropdowns se ferment automatiquement à chaque transition de page.

---

---

## Phase 4.57 — Optimisations finales & Polish

### Résumé

Passage sur l’accessibilité (lien d’évitement, cibles tactiles raisonnables), les performances images (`next/image` + repli `<img>`), la réduction des animations selon `prefers-reduced-motion`, le polish des transitions UI, et la configuration Next (compression, en-têtes, domaines d’images distantes).

### Accessibilité

| Élément | Détail |
|---------|--------|
| **Lien « Aller au contenu principal »** | Classe `.skip-to-content` dans `globals.css` — visible au focus clavier uniquement, ancre `#main-content` |
| **`<main id="main-content" tabIndex={-1}>`** | Cible de focus possible après activation du skip link |
| **Cibles tactiles** | `min-height: 44px` limité à `button`, `[role="button"]`, `input` (hors checkbox/radio/hidden), `select`, `textarea` — **retrait du sélecteur global `a`** pour ne pas déformer les liens dans le contenu `prose` |

### Images (`components/ui/avatar.tsx`)

- **`next/image`** pour les hôtes OAuth courants (alignés sur `remotePatterns` dans `next.config.ts`) : Google User Content, GitHub avatars, Gravatar, Facebook graph.
- **`<img loading="lazy" decoding="async">`** pour les autres URLs (S3/R2/CDN non listés) afin d’éviter les erreurs runtime sans modifier la config à chaque domaine.
- Prop optionnelle **`priority`** pour les cas LCP (non utilisée par défaut).
- Dimensions explicites **32 / 40 / 56 px** selon la taille pour limiter le CLS.

### `next.config.ts`

- `poweredByHeader: false`
- `compress: true` (gzip/brotli côté serveur de prod)
- `images.deviceSizes` / `imageSizes` affinés pour les layouts courants
- `images.remotePatterns` pour les fournisseurs d’avatars listés ci-dessus

### CSS global (`globals.css`)

- **`prefers-reduced-motion: reduce`** : `scroll-behavior: auto` + raccourcissement des `animation` et `transition` (évite nausée / économie batterie)

### Micro-interactions UI

- **Button** : `duration-200 ease-out` sur les transitions de couleur
- **Card** (mode `hover`) : `duration-200 ease-out` sur l’ombre
- **ServiceResultCard** : léger `translate-y` au survol du groupe + **anneau focus visible** sur le lien (`focus-visible:ring-2`)

### Métadonnées racine (`layout.tsx`)

- `applicationName` dans `metadata` (PWA / install prompt futurs)
- `Inter` : `preload: true`, `adjustFontFallback: true`

### Lighthouse & QA

À lancer en local après `npm run build && npm start` :

```bash
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./lighthouse-report.html
```

*(Nécessite Chrome ; le paquet `lighthouse` peut être installé en dev si besoin.)*

Vérifier manuellement : Tab depuis le chargement de la page → le skip link apparaît en premier ; navigation clavier dans le header et les cartes de recherche.

---

---

## Phase 4.58 — Préparation déploiement

### Résumé

Livrables pour passer en production : endpoint de santé (`/api/health`), build **standalone** Next.js pour Docker, `Dockerfile` + `.dockerignore`, guide **`docs/deploiement.md`** (variables, migrations, sauvegardes PostgreSQL, Chariow, Sentry, checklists), extension de **`.env.example`**, script **`npm run docker:build`**.

### API `GET /api/health`

- Fichier : `src/app/api/health/route.ts`
- `force-dynamic` — pas de cache
- Exécute `SELECT 1` via Prisma ; **200** si la base répond, **503** sinon
- Corps JSON : `status`, `timestamp`, `version` (lue depuis `package.json`), `checks.database`

### Next.js `output: "standalone"`

- Dans `next.config.ts` — trace les dépendances serveur pour une image Docker minimale (`server.js`).

### Docker

- **`Dockerfile`** : multi-stage (deps → builder avec `prisma generate` + `npm run build` → runner `node server.js`)
- **`HEALTHCHECK`** : requête Node `fetch` vers `/api/health`
- **`.dockerignore`** : exclut `node_modules`, `.next`, `.env`, etc.

### Documentation

- **`docs/deploiement.md`** : référence unique pour l’équipe (env, health, Docker, `pg_dump`, Sentry via wizard, webhook Chariow, checklist go-live, note Vercel).

### Variables documentées (`.env.example`)

- Bloc commenté production : `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL` avec SSL, `CONTACT_EMAIL`, `SENTRY_*`.

### Monitoring Sentry

- Pas d’installation automatique du SDK (évite une grosse dépendance et un diff Next massif) : procédure **`npx @sentry/wizard@latest -i nextjs`** décrite dans `docs/deploiement.md`.

---

---

## Phase 4.59 — Durcissement & conformité

### Résumé

Renforcement contre les abus (rate limiting), en-têtes de sécurité globaux (CSP, frame deny, HSTS optionnel au build), documentation opérationnelle RGPD / logs, et mise à jour de la **politique de confidentialité** (conservation, sous-traitants, droits + lien CNIL).

### Rate limiting

| Cible | Limite | Fichier |
|-------|--------|---------|
| `POST` Auth avec `credentials` dans le chemin | 10 / 15 min / IP | `middleware.ts` |
| Inscription client ou vendeur | 10 / heure / IP | `auth-actions.ts` (`limitRegistrations`) |
| Formulaire contact | 5 / heure / IP | `contact-actions.ts` |

Moteur : `src/lib/rate-limit-memory.ts` (Map en mémoire, purge à 10k clés). Documenté pour migration Redis / Upstash en multi-instances dans `docs/conformite-et-logs.md`.

Helpers : `getClientIpFromHeaders` dans `src/lib/client-ip.ts`.

### En-têtes (`next.config.ts`)

Fonction `headers()` sur `/:path*` : `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, **CSP** (sans `unsafe-eval` en prod), `Strict-Transport-Security` si `ENABLE_HSTS=1`, `upgrade-insecure-requests` si `ENABLE_CSP_UPGRADE=1`.

### Middleware

- Export `auth((req) => …)` avec contrôle rate limit avant la chaîne Auth pour les POST credentials.
- `matcher` : `/tableau-de-bord/:path*` et `/api/auth/:path*`.

### Tests

- `src/lib/rate-limit-memory.test.ts` — cas limite et clés distinctes.
- `contact-actions.test.ts` — mock `next/headers`, reset du store, test du 6e envoi bloqué.

### Documentation & légal utilisateur

- **`docs/conformite-et-logs.md`** — tableau rate limit, en-têtes, rétention logs, chantier RGPD (DPA, registre).
- **`docs/deploiement.md`** — lien vers ce document.
- **`src/app/confidentialite/page.tsx`** — conservation détaillée, sous-traitants, droits RGPD, délai de réponse, lien [CNIL](https://www.cnil.fr).
- **`.env.example`** — `ENABLE_HSTS`, `ENABLE_CSP_UPGRADE`.

---

## Phase 4.60 — Finitions produit & lancement

### Résumé

Préparer la **première mise en production** : visibilité pour les utilisateurs (statut, notes), message de maintenance optionnel, et **procédure de gel de version** documentée.

### Bannière de maintenance

- Composant `MaintenanceBanner` (`src/components/layout/maintenance-banner.tsx`), rendu dans `layout.tsx` au-dessus du header.
- Activée si `NEXT_PUBLIC_MAINTENANCE_BANNER` vaut `1`, `true` ou `yes` ; texte via `NEXT_PUBLIC_MAINTENANCE_MESSAGE` (sinon libellé générique).
- Fermeture par l’utilisateur persistée dans `sessionStorage` (clé `maintenance-banner-dismissed`).

### Page statut publique

- Route **`/statut`** — `StatusPanel` (client) interroge `GET /api/health` et affiche application + base de données, version `package.json`, et optionnellement `NEXT_PUBLIC_APP_RELEASE_LABEL`.

### Notes de version (communication release)

- Fichier **`docs/RELEASE_NOTES.md`** — contenu éditorialisé (gel v0.1.0, rappel périmètre, procédure tag / Docker).
- Route **`/aide/versions`** — lecture du markdown au runtime, rendu simple (`#` / `##` / `###` / listes `- `).
- Liens ajoutés dans le menu Aide du header et dans le pied de page.

### Sitemap & déploiement

- `sitemap.ts` : URLs `/statut` et `/aide/versions`.
- `docs/deploiement.md` : §9 Phase 4.60 (tableau env, gel de version, liens) ; checklist go-live enrichie ; ancien §9 Vercel renommé §10.

### Variables d’environnement

Voir `.env.example` : `NEXT_PUBLIC_MAINTENANCE_*`, `NEXT_PUBLIC_APP_RELEASE_LABEL`.

---

## Phase 4.61 — Post go-live & observabilité

### Résumé

Première itération après la mise en production : **lien vers une page de statut externe** (fournisseur tiers) et **feature flags serveur** légers pour activer progressivement du code sans surcharger le dépôt.

### Page `/statut`

- Prop optionnelle `externalStatusUrl` sur `StatusPanel`, alimentée par `NEXT_PUBLIC_EXTERNAL_STATUS_URL` depuis `statut/page.tsx`.
- Lien « page de statut détaillée » (`target="_blank"`, `rel="noopener noreferrer"`).

### Feature flags (serveur)

- Module `src/lib/feature-flags.ts` — fonction `serverFeatureEnabled(flag)` avec convention `FEATURE_<NOM_EN_MAJUSCULES>=1|true|yes`.
- Tests : `src/lib/feature-flags.test.ts`.
- Usage : server components, server actions, routes API uniquement (éviter d’exposer des branches sensibles au client).

### Documentation

- `docs/deploiement.md` — sous-section *Post go-live (Phase 4.61)* dans le §9.
- `.env.example` — `NEXT_PUBLIC_EXTERNAL_STATUS_URL`, exemple `FEATURE_BETA_SELLER_ANALYTICS`.

---

## Phase 4.62 — Sentry & périmètre post-release

### Résumé

**Monitoring d’erreurs** avec `@sentry/nextjs` (instrumentation Node + Edge, client, `global-error`, tunnel `/monitoring`, `withSentryConfig`). Activation **uniquement** si un DSN est défini ; pas de changement de comportement sans variables.

### Fichiers

| Fichier | Rôle |
|---------|------|
| `src/instrumentation.ts` | `register()` + `onRequestError` → `captureRequestError` |
| `src/instrumentation-client.ts` | Init client + `onRouterTransitionStart` |
| `src/sentry.server.config.ts` / `sentry.edge.config.ts` | Init serveur / edge |
| `src/sentry.shared.ts` | Résolution DSN (serveur : `SENTRY_DSN` ou `NEXT_PUBLIC_*` ; navigateur : `NEXT_PUBLIC_SENTRY_DSN` uniquement) |
| `src/app/global-error.tsx` | Erreurs React racine + `captureException` |
| `next.config.ts` | `withSentryConfig` (tunnel, upload source maps si token) |

### Backlog suggéré (non implémenté ici)

- **Files d’attente durables** : traité en **Phase 4.64** via table PostgreSQL `EmailOutbox` (pas Redis).
- **i18n** : traité en **Phase 4.64** pour les surfaces publiques (header, footer, lien d’évitement) avec `next-intl` et cookie `NEXT_LOCALE`.
- **Phase 5** : cadrage produit (croissance, app mobile, etc.).

### Documentation

- `docs/deploiement.md` §6 mis à jour.
- `.env.example` — variables Sentry.

---

## Phase 4.63 — Travail différé après réponse (`after`)

### Résumé

Première brique **hors bande passante** pour les e-mails transactionnels : exécution via **`after()`** (Next.js) après envoi de la réponse HTTP, avec **repli** microtask si `after` n’est pas disponible (tests, scripts).

### Implémentation

| Fichier | Rôle |
|---------|------|
| `src/lib/deferred.ts` | `deferAfterResponse(task)` — enveloppe `after` + `catch` → `Promise.resolve().then(task)` |
| `src/lib/notifications.ts` | (4.63) Envoi différé ; **4.64** : enqueue outbox + `processEmailOutboxBatch` |
| `src/lib/contact-actions.ts` | (4.63) Différé ; **4.64** : enqueue outbox + batch |
| `src/lib/deferred.test.ts` | Tests mock `next/server` + repli |

### Limites (historique)

- Avant la **Phase 4.64**, seul `after()` / microtask garantissait l’ordre par rapport à la réponse HTTP, **sans persistance** si le process s’arrêtait. La file PostgreSQL `EmailOutbox` (4.64) complète ce schéma.

### Documentation

- `docs/deploiement.md` — paragraphe sur `after` et e-mails.
- `docs/RELEASE_NOTES.md` — entrée technique.
- `docs/ARBORESCENCE.md` — `deferred.ts` + tests.

---

## Phase 4.64 — File d’e-mails PostgreSQL + i18n public (FR/EN)

### Résumé

- **Outbox durable** : les e-mails déclenchés par `notifications.ts` et le formulaire contact sont **enregistrés** dans `EmailOutbox` (Prisma), puis envoyés via `processEmailOutboxBatch` après la réponse HTTP (`deferAfterResponse`, comme en 4.63) **et** peuvent être rejoués par un **cron** HTTP.
- **Internationalisation** : `next-intl` avec **cookie** `NEXT_LOCALE` (`fr` \| `en`) — pas de réécriture de l’arbre `app/` en `[locale]`. Surfaces traduites en premier passage : **header**, **footer**, **lien « skip to content »** dans `layout.tsx`.

### Schéma Prisma

- Enum `EmailOutboxStatus` : `PENDING`, `SENT`, `FAILED`.
- Modèle `EmailOutbox` : `kind`, `payload` (JSON), `status`, `attempts`, `lastError`, `createdAt`, `processedAt`, index `(status, createdAt)`.

### Code

| Fichier | Rôle |
|---------|------|
| `src/lib/outbox-email.ts` | `enqueueEmailOutbox`, `processEmailOutboxBatch` (max 5 tentatives, dispatch vers `email.ts`) |
| `src/lib/notifications.ts` | Enqueue + `deferAfterResponse(() => processEmailOutboxBatch(25))` |
| `src/lib/contact-actions.ts` | Enqueue message contact + même différé |
| `src/app/api/cron/outbox/route.ts` | `GET` protégé par `CRON_SECRET` (`Authorization: Bearer …` ou `?secret=`) |
| `src/i18n/request.ts` | `getRequestConfig` : locale depuis cookie `NEXT_LOCALE` |
| `messages/fr.json`, `messages/en.json` | Messages UI publics |
| `src/lib/locale-actions.ts` | Server action `setUserLocale` |
| `src/components/layout/language-switcher.tsx` | FR / EN + `router.refresh()` |
| `next.config.ts` | `createNextIntlPlugin` composé avec `withSentryConfig` |
| `src/app/layout.tsx` | `NextIntlClientProvider`, `lang` dynamique |

### Variables d’environnement

- `CRON_SECRET` — obligatoire pour que `/api/cron/outbox` réponde (sinon 503). Voir `.env.example`.

### Tests

- `src/lib/outbox-email.test.ts` — mock Prisma + `sendMail` (succès / échec).
- `src/lib/contact-actions.test.ts` — assert sur `enqueueEmailOutbox`.

### Documentation & exploitation

- `docs/deploiement.md` — cron outbox + `CRON_SECRET`.
- `docs/ARBORESCENCE.md` — nouveaux chemins.
- `docs/RELEASE_NOTES.md` — entrée 4.64.

---

## Prochaine étape recommandée

1. **Phase 5** : cadrage produit / roadmap post-MVP — voir [`phase-5-croissance-et-evolution.md`](./phase-5-croissance-et-evolution.md) (piliers V2/V3, jalons 5.1–5.6 indicatifs).
2. **Extension i18n** : étendre les traductions aux pages marketing / formulaires publics, métadonnées `alternates` par locale, éventuellement `nameEn` côté catégories.
