# Phase 2 — UX / UI

## Objectifs

Définir le **design system**, les **principes UX** adaptés au contexte africain, l'**arborescence** de l'application, les **wireframes textuels** de chaque écran clé, la **structure des dashboards**, les **parcours d'onboarding et tutoriels**, et le **traitement des états vides, erreurs et aides contextuelles** — avant toute ligne de code UI.

---

## 23. Design system

### 23.1 Philosophie

> « Clair, rassurant, rapide, accessible sur mobile bas de gamme. »

- **Mobile-first** : tout composant conçu pour écran 360 px puis adapté vers tablette/desktop.
- **Lisibilité** : tailles de texte minimales élevées, contrastes AA+ (WCAG 2.1), espacement généreux.
- **Confiance** : couleurs associées à la sécurité (bleu/vert) pour les zones « argent », alertes explicites.
- **Poids léger** : SVG icônes, pas de bibliothèque lourde d'icônes ; images compressées WebP ; peu de JS client.

### 23.2 Palette de couleurs (tokens Tailwind)

| Token | Valeur HEX | Usage |
|-------|-----------|-------|
| `primary-600` | `#2563EB` | CTA principaux, liens actifs, accents |
| `primary-700` | `#1D4ED8` | Hover CTA |
| `primary-50` | `#EFF6FF` | Arrière-plans légers de section |
| `success-600` | `#16A34A` | Confirmation, paiement réussi, badge vérifié |
| `success-50` | `#F0FDF4` | Fond succès |
| `warning-500` | `#EAB308` | Avertissement, en attente |
| `warning-50` | `#FEFCE8` | Fond avertissement |
| `danger-600` | `#DC2626` | Erreurs, suppression, litige |
| `danger-50` | `#FEF2F2` | Fond erreur |
| `neutral-900` | `#111827` | Texte principal |
| `neutral-600` | `#4B5563` | Texte secondaire |
| `neutral-300` | `#D1D5DB` | Bordures, séparateurs |
| `neutral-100` | `#F3F4F6` | Arrière-plans de page |
| `neutral-50` | `#F9FAFB` | Arrière-plans de cartes |
| `white` | `#FFFFFF` | Fond principal |

Toutes les couleurs sont extensibles pour un **mode sombre** (V2) via CSS variables / Tailwind `dark:`.

### 23.3 Typographie

| Rôle | Police | Taille mobile | Taille desktop | Poids |
|------|--------|---------------|----------------|-------|
| Display / Hero | Inter | 28 px | 40 px | 700 |
| H1 | Inter | 24 px | 32 px | 700 |
| H2 | Inter | 20 px | 24 px | 600 |
| H3 | Inter | 18 px | 20 px | 600 |
| Body | Inter | 16 px | 16 px | 400 |
| Body small | Inter | 14 px | 14 px | 400 |
| Caption | Inter | 12 px | 12 px | 400 |

**Pourquoi Inter :** gratuite, excellente lisibilité sur écran, étendue caractères latins/diacritiques, variable font (performance). Chargée via `next/font` (pas de requête Google externe bloquante).

### 23.4 Espacement & grille

- Unité de base : **4 px** (Tailwind `1` = 4 px).
- Grille : **12 colonnes** desktop (gouttière 24 px), conteneur max **1 280 px** centré, mobile **1 colonne** avec padding 16 px.
- Sections : marge verticale `32–48 px` mobile, `48–64 px` desktop.
- Touch targets : minimum **44 × 44 px** (Apple HIG / WCAG).

### 23.5 Rayons, ombres, bordures

| Token | Valeur | Usage |
|-------|--------|-------|
| `radius-sm` | 6 px | Inputs, chips |
| `radius-md` | 8 px | Cartes, modales |
| `radius-lg` | 12 px | Grandes cartes service |
| `radius-full` | 9999 px | Avatars, badges |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,.05)` | Cartes légères |
| `shadow-md` | `0 4px 6px rgba(0,0,0,.07)` | Cartes survol, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,.1)` | Modales |

### 23.6 Composants UI de base (inventaire pour Phase 3)

| Composant | Variantes | Notes |
|-----------|-----------|-------|
| **Button** | primary, secondary, outline, ghost, danger ; sizes sm/md/lg ; disabled, loading | Icône optionnelle gauche/droite |
| **Input** | text, email, tel, password, textarea, search ; error state, helper text | Label toujours visible (pas placeholder seul) |
| **Select** | native mobile, custom desktop ; multi-select filtres | Performance : natif sur mobile |
| **Checkbox / Radio** | standard, card-select | Grand touch target |
| **Badge** | status (couleur dynamique), icon badge, notification count | Mapping statut commande → couleur |
| **Card** | service card, order card, conversation card, stat card | Skeleton loading intégré |
| **Avatar** | tailles sm/md/lg ; fallback initiales | Chargement progressif |
| **Tag / Chip** | filtres actifs, catégories, langues | Supprimable (×) |
| **Modal / Drawer** | drawer bottom-sheet mobile, modal centré desktop | Focus trap, escape ferme |
| **Toast** | success, error, warning, info | Auto-dismiss 5 s, empilable |
| **Tabs** | horizontal, scrollable mobile | Indicateur actif |
| **Stepper** | vertical (onboarding), horizontal (commande) | État actuel surligné |
| **Timeline** | commande, litige | Points colorés par statut |
| **Empty state** | illustration + message + CTA | Un par contexte (voir section 29) |
| **Skeleton** | lignes, carte, avatar | Utilisé systématiquement |
| **Tooltip** | texte court, aide contextuelle | Déclenché tap long mobile / hover desktop |
| **Progress bar** | déterminée (profil complétude), indéterminée (chargement) | Couleur primaire |
| **File upload** | drag-drop desktop, bouton mobile ; preview ; progress | Limite taille affichée |
| **Star rating** | input (1–5), display | Grand touch target en input |
| **Price display** | montant + devise + label (ex. « à partir de ») | Formatage localisé |
| **Status pill** | mapping OrderStatus → couleur + libellé FR | Réutilisé partout |

### 23.7 Iconographie

- Jeu **Lucide** (MIT, léger, cohérent, tree-shakable).
- Taille par défaut **20 px** body, **24 px** navigation, **16 px** inline.
- Stroke **1.5 px**.

---

## 24. Principes UX pour public peu technique (contexte africain)

### 24.1 Règles directrices

1. **Une action principale par écran.** Tout écran mobile a un CTA dominant (couleur primaire, bas d'écran ou sticky). Les actions secondaires sont visuellement recul (outline/ghost).

2. **Libellés explicites, pas d'icônes seules.** Chaque bouton affiche un texte lisible. Icône = renforcement, jamais seul véhicule de sens.

3. **Vocabulaire français courant.** « Payer maintenant » au lieu de « Procéder au checkout ». « Votre argent est protégé » au lieu de « Escrow actif ». Glossaire technique absent de l'UI ; notes explicatives si nécessaire.

4. **Statuts toujours accompagnés d'une phrase.** Un badge « En attente » est suivi de « Le vendeur n'a pas encore commencé le travail ». Montants répétés : « 15 000 FCFA sont en sécurité sur la plateforme ».

5. **Feedback immédiat.** Toast ou animation de confirmation après toute action (envoi message, paiement, validation). Sur réseau lent : indicateur skeleton / spinner + texte « Chargement en cours… ».

6. **Reprise d'erreur sans perte de données.** Brouillon automatique messages et formulaires. Reprise d'envoi de fichier si coupure. Message d'erreur explique **quoi faire** (« Vérifiez votre connexion et réessayez »).

7. **Navigation simple et prévisible.** Barre inférieure mobile (max 5 items). Retour en arrière toujours possible. Fil d'Ariane sur desktop. Pas de menu hamburger profond.

8. **Confiance visuelle permanente.** Badges vérification à côté des vendeurs. Cadenas/icône sécurité près de tout montant. Politique annulation visible avant paiement.

9. **Performance perçue.** Squelettes de chargement. Optimistic UI sur actions non critiques (like, favoris). Images en WebP avec placeholder flou.

10. **Accessibilité de base.** Contraste 4.5:1 texte, 3:1 éléments interactifs. Focus visible au clavier. `aria-label` sur icônes sans texte. Pas de contenu transmis uniquement par la couleur.

### 24.2 Spécificités réseau / appareils

- **Hors ligne léger** : les brouillons messages et formulaires sont stockés en `localStorage` et ré-envoyés à la reconnexion (PWA service worker planifié).
- **Poids de page** cible : < **200 Ko** JS initial gzippé, < **500 Ko** total au-dessus de la ligne de flottaison.
- **Images** : `next/image` avec `sizes` adaptés, WebP, lazy loading, placeholder `blur`.
- **Polices** : subset latin uniquement, variable font unique, chargement `swap`.

### 24.3 Gestion multi-langue

- **Locale par défaut** : `fr`.
- Architecture `next-intl` : fichiers JSON par namespace (`common`, `catalog`, `order`, `payment`, `dispute`, `onboarding`…).
- Sélecteur de langue dans le footer et les paramètres.
- Format montant/date/nombre : `Intl.NumberFormat` / `Intl.DateTimeFormat` adapté au locale.

---

## 25. Arborescence applicative (sitemap)

```
/ (accueil)
├── /auth
│   ├── /connexion
│   ├── /inscription
│   ├── /inscription/vendeur          ← onboarding spécifique
│   ├── /mot-de-passe-oublie
│   └── /verification                ← email / téléphone
│
├── /services
│   ├── /[categorie-slug]
│   │   └── /[sous-categorie-slug]
│   └── /[service-slug]               ← fiche service
│
├── /vendeur/[seller-slug]             ← profil public vendeur
│
├── /recherche?q=…&cat=…&prix=…       ← résultats + filtres
│
├── /tableau-de-bord                   ← redirect rôle → sous-route
│   │
│   ├── /client                        ← dashboard client
│   │   ├── /commandes
│   │   │   └── /[order-id]            ← détail + timeline
│   │   ├── /messages
│   │   │   └── /[conversation-id]
│   │   ├── /favoris
│   │   ├── /paiements
│   │   ├── /litiges
│   │   │   └── /[dispute-id]
│   │   ├── /notifications
│   │   ├── /profil
│   │   └── /aide
│   │
│   ├── /vendeur                       ← dashboard vendeur
│   │   ├── /services
│   │   │   ├── /nouveau
│   │   │   └── /[service-id]/modifier
│   │   ├── /commandes
│   │   │   └── /[order-id]
│   │   ├── /messages
│   │   │   └── /[conversation-id]
│   │   ├── /revenus                   ← wallet + historique
│   │   ├── /retraits
│   │   ├── /performances
│   │   ├── /avis
│   │   ├── /profil
│   │   ├── /notifications
│   │   └── /aide
│   │
│   ├── /support                       ← dashboard support
│   │   ├── /litiges
│   │   │   └── /[dispute-id]
│   │   ├── /signalements
│   │   └── /utilisateurs/[user-id]
│   │
│   └── /admin                         ← dashboard admin
│       ├── /apercu                     ← KPIs globaux
│       ├── /utilisateurs
│       ├── /vendeurs
│       ├── /categories
│       ├── /commandes
│       ├── /paiements
│       ├── /escrow
│       ├── /retraits
│       ├── /litiges
│       ├── /commissions
│       ├── /moderation
│       ├── /notifications
│       ├── /parametres
│       └── /journal-audit
│
├── /aide
│   ├── /guide-client
│   ├── /guide-vendeur
│   └── /faq
│
├── /a-propos
├── /conditions
├── /confidentialite
└── /contact
```

**Décisions :**
- URLs en **français** (slug i18n) pour SEO et lisibilité utilisateur ; architecture `next-intl` pour préfixe locale optionnel (`/en/…`).
- Chaque rôle a un sous-arbre `/tableau-de-bord/[role]` : pas de mélange d'interfaces.
- Pages publiques (`/services`, `/vendeur/…`, `/aide`) accessibles sans compte.

---

## 26. Wireframes textuels — écrans clés

Les wireframes suivent la convention :
- `[ ]` = zone / bloc
- `( )` = bouton / lien
- `---` = séparateur
- `>` = navigation / breadcrumb
- `« »` = contenu textuel affiché
- Mobile-first (empilé verticalement).

---

### 26.1 Page d'accueil `/`

```
┌─────────────────────────────────────┐
│ [Header]                            │
│  Logo   (Rechercher)  (Connexion)   │
├─────────────────────────────────────┤
│ [Hero]                              │
│  « Trouvez le bon prestataire       │
│    pour votre projet »              │
│  [Barre de recherche pleine largeur]│
│  (Rechercher)                       │
├─────────────────────────────────────┤
│ [Catégories populaires]             │
│  🎨 Design   💻 Dev   📝 Rédaction │
│  📊 Business  🎶 Audio  📸 Photo   │
│  (Voir toutes les catégories →)     │
├─────────────────────────────────────┤
│ [Services en vedette]               │
│  [Carte service] [Carte service]    │
│  [Carte service] [Carte service]    │
│  (Voir plus →)                      │
├─────────────────────────────────────┤
│ [Bloc confiance]                    │
│  🔒 « Paiement sécurisé »          │
│  ✅ « Vendeurs vérifiés »           │
│  ⏱️ « Livraison suivie »            │
│  💬 « Support réactif »             │
├─────────────────────────────────────┤
│ [Comment ça marche — 4 étapes]      │
│  1. Cherchez → 2. Contactez →       │
│  3. Payez → 4. Recevez              │
├─────────────────────────────────────┤
│ [CTA vendeur]                       │
│  « Proposez vos services »          │
│  (Devenir vendeur)                  │
├─────────────────────────────────────┤
│ [Footer]                            │
│  Liens: À propos, Aide, Conditions  │
│  Confidentialité, Contact, Langue   │
└─────────────────────────────────────┘
```

### 26.2 Fiche service `/services/[service-slug]`

```
┌─────────────────────────────────────┐
│ > Catégorie > Sous-catégorie        │
├─────────────────────────────────────┤
│ [Galerie portfolio — carrousel]     │
├─────────────────────────────────────┤
│ [Titre service]                     │
│ [Avatar vendeur] NomVendeur ✅       │
│ ⭐ 4.8 (127 avis) • Répond en 2h   │
├─────────────────────────────────────┤
│ [Onglets packages] Basique|Standard|│
│                     Premium         │
│ ┌─────────────────────────────────┐ │
│ │ « Basique — Logo simple »      │ │
│ │ 15 000 FCFA                    │ │
│ │ ✓ 1 concept ✓ Fichier PNG      │ │
│ │ ✓ Livraison 3 jours            │ │
│ │ ✓ 1 révision                   │ │
│ │ (Commander — 15 000 FCFA)      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Extras disponibles]                │
│ ☐ Livraison express +5 000 FCFA    │
│ ☐ Fichier source +3 000 FCFA       │
├─────────────────────────────────────┤
│ [Description détaillée]             │
├─────────────────────────────────────┤
│ [FAQ du service]                    │
│  ▸ Comment se passe la livraison ?  │
│  ▸ Quels formats de fichier ?       │
├─────────────────────────────────────┤
│ [Avis récents]                      │
│  ⭐⭐⭐⭐⭐ « Excellent travail… »  │
│  ⭐⭐⭐⭐ « Bien mais un peu lent » │
│  (Voir tous les avis →)            │
├─────────────────────────────────────┤
│ [Services similaires]               │
│  [Carte] [Carte] [Carte]           │
├─────────────────────────────────────┤
│ [Sticky bottom mobile]              │
│  15 000 FCFA  (Contacter) (Commander│
└─────────────────────────────────────┘
```

### 26.3 Carte service (composant réutilisable)

```
┌───────────────────────┐
│ [Image miniature]     │
│ ♡ (favori)            │
├───────────────────────┤
│ [Avatar] NomVendeur ✅ │
│ « Titre du service…  »│
│ ⭐ 4.8 (127)           │
│ À partir de            │
│ 15 000 FCFA            │
└───────────────────────┘
```

### 26.4 Page recherche `/recherche`

```
┌─────────────────────────────────────┐
│ [Barre recherche pré-remplie]       │
├─────────────────────────────────────┤
│ [Filtres — drawer mobile / sidebar  │
│  desktop]                           │
│  • Catégorie (select)               │
│  • Prix min — max (range)           │
│  • Délai de livraison               │
│  • Langue du vendeur                │
│  • Localisation                     │
│  • Note minimum                     │
│  • Badge vérifié uniquement         │
│  (Appliquer)  (Réinitialiser)       │
├─────────────────────────────────────┤
│ [Tri : Pertinence | Prix ↑ | ↓ |   │
│        Mieux notés | Récents]       │
├─────────────────────────────────────┤
│ « 48 services trouvés »             │
│ [Chip filtres actifs ×] [Chip ×]    │
├─────────────────────────────────────┤
│ [Grille cartes service]             │
│ [Carte] [Carte]                     │
│ [Carte] [Carte]                     │
│ …                                   │
│ (Charger plus)                      │
└─────────────────────────────────────┘
```

### 26.5 Messagerie `/tableau-de-bord/client/messages`

```
┌─────────────────────────────────────┐
│ [Liste conversations — panneau G]   │
│ (Rechercher conversation)           │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] NomVendeur             │ │
│ │ « Dernier message… »   14:32   │ │
│ │ 🔵 non lu                       │ │
│ ├─────────────────────────────────┤ │
│ │ [Avatar] NomVendeur2            │ │
│ │ « Merci pour le fichier » Hier  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Fil de discussion — panneau D]     │
│ [En-tête : avatar + nom + service]  │
│ ─────────────────────────────────── │
│ 💬 Message vendeur         14:30    │
│ 💬 Mon message              14:31   │
│ 📎 Fichier joint            14:32   │
│ [Système] « Offre reçue — 25 000 F │
│           CFA pour Logo Premium »   │
│   (Accepter l'offre) (Décliner)     │
│ ─────────────────────────────────── │
│ [Zone saisie]                       │
│ (📎 Joindre) [Tapez un message…]   │
│                          (Envoyer)  │
└─────────────────────────────────────┘
```

**Mobile :** liste plein écran → tap → fil plein écran avec bouton retour.

### 26.6 Détail commande `/tableau-de-bord/client/commandes/[id]`

```
┌─────────────────────────────────────┐
│ > Commandes > CMD-A1B2C3            │
├─────────────────────────────────────┤
│ [Statut] 🟢 « En cours »           │
│ « Le vendeur travaille sur votre    │
│   commande. Livraison prévue le     │
│   15 avril 2026. »                  │
├─────────────────────────────────────┤
│ [Timeline verticale]                │
│ ● Commande créée — 8 avr           │
│ ● Paiement confirmé — 8 avr        │
│   « 15 000 FCFA protégés           │
│     en escrow »                     │
│ ● Travail en cours — 9 avr         │
│ ○ Livraison attendue — 15 avr      │
│ ○ Validation                        │
├─────────────────────────────────────┤
│ [Récapitulatif]                     │
│  Service : « Création de logo »     │
│  Package : Standard                 │
│  Extras : Livraison express         │
│  ──────────────────                 │
│  Sous-total :       15 000 FCFA     │
│  Extra express :    +5 000 FCFA     │
│  Total payé :       20 000 FCFA     │
│  Commission :       (non affiché    │
│                     au client)      │
│  Vendeur :          NomVendeur ✅    │
├─────────────────────────────────────┤
│ [Brief / fichiers envoyés]          │
│  📄 brief.pdf  📷 reference.jpg     │
├─────────────────────────────────────┤
│ [Actions selon statut]              │
│  (Contacter le vendeur)             │
│  (Demander une révision)  ← si livré│
│  (Confirmer la réception) ← si livré│
│  (Ouvrir un litige)                 │
└─────────────────────────────────────┘
```

### 26.7 Paiement (étape après « Commander »)

```
┌─────────────────────────────────────┐
│ « Récapitulatif de votre commande » │
├─────────────────────────────────────┤
│ [Carte service mini]                │
│ Package : Standard — 15 000 FCFA    │
│ Extra : Express — +5 000 FCFA       │
│ ─────────────────────               │
│ Total : 20 000 FCFA                 │
├─────────────────────────────────────┤
│ 🔒 « Votre argent est protégé.     │
│ Il ne sera versé au vendeur         │
│ qu'après votre validation. »        │
├─────────────────────────────────────┤
│ [Brief — optionnel]                 │
│ « Décrivez votre besoin… »          │
│ (📎 Joindre des fichiers)           │
├─────────────────────────────────────┤
│ [Choix de paiement — si applicable] │
│ ○ Payer la totalité — 20 000 FCFA   │
│ ○ Payer un acompte — 10 000 FCFA    │
│   « Le solde sera demandé           │
│     avant livraison. »              │
├─────────────────────────────────────┤
│ (Payer 20 000 FCFA →)              │
│ « En payant, vous acceptez les      │
│   conditions d'utilisation. »       │
└─────────────────────────────────────┘
```

### 26.8 Profil public vendeur `/vendeur/[slug]`

```
┌─────────────────────────────────────┐
│ [Bannière / couleur]                │
│ [Avatar]                            │
│ NomVendeur ✅                        │
│ « Graphiste freelance, Dakar »      │
│ 🇸🇳 Sénégal • FR, EN               │
│ ⭐ 4.8 (127 avis) • Répond en 2h    │
│ Membre depuis janv. 2026            │
│ ──────────────────                  │
│ [Bio]                               │
│ « Passionné de design depuis 8 ans…»│
├─────────────────────────────────────┤
│ [Stats : commandes livrées,         │
│  taux livraison à temps,            │
│  taux satisfaction]                 │
├─────────────────────────────────────┤
│ [Services publiés]                  │
│ [Carte] [Carte] [Carte]            │
├─────────────────────────────────────┤
│ [Derniers avis]                     │
│ ⭐⭐⭐⭐⭐ « Très professionnel… »   │
│ (Voir tous les avis →)             │
├─────────────────────────────────────┤
│ (Contacter ce vendeur)              │
└─────────────────────────────────────┘
```

### 26.9 Inscription & connexion `/auth/inscription`

```
┌─────────────────────────────────────┐
│ Logo                                │
│ « Créez votre compte »              │
├─────────────────────────────────────┤
│ [Prénom]                            │
│ [Email]                             │
│ [Téléphone — optionnel]             │
│ [Mot de passe]                      │
│ [Confirmer mot de passe]            │
├─────────────────────────────────────┤
│ ☐ J'accepte les conditions…         │
│ (Créer mon compte)                  │
├─────────────────────────────────────┤
│ « Vous avez déjà un compte ? »      │
│ (Se connecter)                      │
├─────────────────────────────────────┤
│ — ou —                              │
│ (Continuer avec Google)             │
└─────────────────────────────────────┘
```

### 26.10 Création de service (vendeur) — formulaire multi-étapes

```
[Stepper horizontal : 1.Infos → 2.Packages → 3.Galerie → 4.FAQ → 5.Publier]

─── Étape 1 : Informations ───────────
│ [Titre du service]                  │
│ [Catégorie — select]                │
│ [Sous-catégorie — select]           │
│ [Description]                       │
│ [Tags — multi-chip]                 │
│ [Langues — multi-chip]              │
│ [Zones desservies — multi-chip]     │
│ (Suivant →)                         │

─── Étape 2 : Packages ───────────────
│ [Tableau 3 colonnes]                │
│         Basique | Standard | Premium│
│ Titre   [    ]  [    ]     [    ]   │
│ Descript.[   ]  [    ]     [    ]   │
│ Prix     [    ] [    ]     [    ]   │
│ Délai    [    ] [    ]     [    ]   │
│ Révisions[   ] [    ]     [    ]   │
│ ────────────────────                │
│ [Extras]                            │
│ (+ Ajouter un extra)                │
│ (← Précédent)     (Suivant →)       │

─── Étape 3 : Galerie ────────────────
│ (Ajouter des images/vidéos)         │
│ [Zone drag-drop / bouton upload]    │
│ [Miniatures réordonnables]          │
│ (← Précédent)     (Suivant →)       │

─── Étape 4 : FAQ ────────────────────
│ [Question 1] [Réponse 1]           │
│ (+ Ajouter une question)            │
│ (← Précédent)     (Suivant →)       │

─── Étape 5 : Vérification ───────────
│ [Résumé complet du service]         │
│ « Votre service sera visible après  │
│   publication. »                    │
│ (← Précédent)                       │
│ (Enregistrer en brouillon)          │
│ (Publier le service ✓)              │
```

---

## 27. Structure des dashboards

### 27.1 Dashboard client

**Navigation latérale mobile (bottom bar) / sidebar desktop :**

| Icône + label | Route | Description |
|--------------|-------|-------------|
| 🏠 Accueil | `/tableau-de-bord/client` | Résumé : commandes actives, messages non lus, actions requises |
| 📦 Commandes | `/…/commandes` | Liste + filtres (statut, date) |
| 💬 Messages | `/…/messages` | Conversations |
| ♡ Favoris | `/…/favoris` | Services enregistrés |
| 💳 Paiements | `/…/paiements` | Historique paiements + reçus |
| ⚠️ Litiges | `/…/litiges` | Dossiers ouverts |
| 🔔 Notifications | `/…/notifications` | Centre notifs |
| 👤 Profil | `/…/profil` | Édition profil, vérifications |
| ❓ Aide | `/…/aide` | Guide + FAQ |

**Page d'accueil dashboard client :**

```
┌─────────────────────────────────────┐
│ « Bonjour, Aminata 👋 »             │
├─────────────────────────────────────┤
│ [Cartes résumé]                     │
│ 📦 2 commandes actives              │
│ 💬 3 messages non lus               │
│ ⏳ 1 action requise                  │
├─────────────────────────────────────┤
│ [Actions requises — liste]          │
│ • Commande CMD-X : le vendeur a     │
│   livré → (Valider) (Demander       │
│   une révision)                     │
├─────────────────────────────────────┤
│ [Commandes récentes]                │
│ [Order card] [Order card]           │
└─────────────────────────────────────┘
```

### 27.2 Dashboard vendeur

**Navigation :**

| Icône + label | Route | Description |
|--------------|-------|-------------|
| 🏠 Accueil | `/tableau-de-bord/vendeur` | KPIs, actions, revenus snapshot |
| 🛍️ Services | `/…/services` | CRUD services, statuts |
| 📦 Commandes | `/…/commandes` | Commandes reçues |
| 💬 Messages | `/…/messages` | Inbox |
| 💰 Revenus | `/…/revenus` | Wallet, historique gains |
| 🏧 Retraits | `/…/retraits` | Demandes de retrait |
| 📊 Performances | `/…/performances` | Stats : réponse, livraison, satisfaction |
| ⭐ Avis | `/…/avis` | Avis reçus, réponses |
| 👤 Profil | `/…/profil` | Édition profil vendeur + KYC |
| 🔔 Notifications | `/…/notifications` | Centre notifs |
| ❓ Aide | `/…/aide` | Guide vendeur + FAQ |

**Page d'accueil dashboard vendeur :**

```
┌─────────────────────────────────────┐
│ « Bienvenue, Koffi 👋 »             │
│ [Checklist onboarding si incomplet] │
│ ☑ Profil complété   ☐ 1er service   │
├─────────────────────────────────────┤
│ [KPI cards]                         │
│ 💰 Revenus ce mois : 150 000 FCFA   │
│ 📦 Commandes actives : 4            │
│ ⭐ Note moyenne : 4.8                │
│ ⏱️ Taux à temps : 92%                │
├─────────────────────────────────────┤
│ [Actions requises]                  │
│ • CMD-Y : livraison due dans 2 j    │
│   → (Livrer maintenant)            │
│ • Nouveau message de Aminata        │
│   → (Répondre)                     │
├─────────────────────────────────────┤
│ [Commandes récentes — liste]        │
└─────────────────────────────────────┘
```

### 27.3 Dashboard admin

**Sidebar permanente (desktop) :**

| Section | Items |
|---------|-------|
| **Général** | Aperçu (KPIs), Journal audit |
| **Utilisateurs** | Clients, Vendeurs (profils, KYC, suspension) |
| **Commerce** | Catégories, Commandes, Commissions |
| **Financier** | Paiements, Escrow, Retraits |
| **Modération** | Litiges, Signalements, Contenu |
| **Contenu** | Aide/tutoriels, Paramètres plateforme |
| **Système** | Notifications système, Feature flags |

**Aperçu admin :**

```
┌─────────────────────────────────────┐
│ [Période : 7j | 30j | 90j | Custom]│
├─────────────────────────────────────┤
│ [KPI row]                           │
│ GMV  |  Commandes  |  Nouveaux      │
│      |             |  utilisateurs  │
├─────────────────────────────────────┤
│ [Graphe revenus / commandes]        │
├─────────────────────────────────────┤
│ [Alertes]                           │
│ ⚠️ 3 litiges ouverts > 48h          │
│ ⚠️ 2 retraits en attente d'approbation│
├─────────────────────────────────────┤
│ [Dernières commandes]               │
│ [Derniers litiges]                  │
└─────────────────────────────────────┘
```

### 27.4 Dashboard support

**Navigation réduite :** Litiges, Signalements, Utilisateur lookup, Journal décisions.

```
┌─────────────────────────────────────┐
│ [Litiges à traiter — classés par    │
│  ancienneté]                        │
│ ┌─────────────────────────────────┐ │
│ │ LIT-001 — CMD-X — ouvert il y  │ │
│ │ a 3h — Motif : « Non-livraison»│ │
│ │ (Voir le dossier →)            │ │
│ └─────────────────────────────────┘ │
│ [Signalements récents]              │
│ [Recherche utilisateur]             │
└─────────────────────────────────────┘
```

---

## 28. Onboarding & tutoriels

### 28.1 Onboarding client (après inscription)

**Étapes :**

1. **Vérification email** — écran « Vérifiez votre boîte mail » + lien renvoi.
2. **Complétion profil** — nom, avatar, pays (optionnel mais encouragé).
3. **Écran de bienvenue** — « 3 choses à savoir » :
   - « Parcourez les services et comparez les offres. »
   - « Contactez un vendeur avant d'acheter si besoin. »
   - « Votre argent est protégé jusqu'à la livraison. »
4. **Redirection** vers page d'accueil ou service qu'il consultait avant inscription.

**Progression :** barre simple en haut (2/3 étapes), pas de questionnaire long.

### 28.2 Onboarding vendeur (après inscription vendeur)

**Checklist persistante dans le dashboard :**

| Étape | État | Description affichée |
|-------|------|---------------------|
| 1 | ☑ | Compte créé |
| 2 | ☐ | Compléter le profil (nom, photo, bio, pays) |
| 3 | ☐ | Vérifier email |
| 4 | ☐ | Vérifier téléphone (optionnel MVP, requis V2) |
| 5 | ☐ | Publier votre premier service |
| 6 | ☐ | KYC si requis (V2) |

Chaque étape : badge vert à la complétion. Barre de progression « Profil complet à 60% ».

**Premier service — assistant guidé :**
- Étapes du formulaire (section 26.10).
- Tooltips contextuels sur chaque champ (ex. « Un titre clair aide les clients à trouver votre service »).
- Prévisualisation « Voici comment votre service apparaîtra ».

### 28.3 Tutoriels — contenu intégré

**Guide client** (`/aide/guide-client`) :

| Chapitre | Contenu |
|----------|---------|
| Créer un compte | Étapes + captures |
| Rechercher un service | Utiliser filtres, comparer |
| Contacter un vendeur | Messagerie, poser les bonnes questions |
| Passer commande | Brief, paiement, confirmation |
| Suivre la livraison | Timeline, statuts expliqués |
| Demander une révision | Quand, comment |
| Confirmer la réception | Ce que ça déclenche (paiement vendeur) |
| Ouvrir un litige | Quand et comment, délais |

**Guide vendeur** (`/aide/guide-vendeur`) :

| Chapitre | Contenu |
|----------|---------|
| Créer votre profil | Conseils photo, bio, pays |
| Publier un service | Packages, prix, galerie |
| Fixer vos prix | Conseils marché, extras |
| Répondre aux messages | Rapidité, ton professionnel |
| Envoyer une offre | Depuis conversation, montant, délai |
| Livrer un service | Fichiers, message de livraison |
| Récupérer vos gains | Wallet, retrait, délais |
| Gérer vos performances | Stats, amélioration |
| Erreurs à éviter | Retards, communication hors plateforme |

**Format :**
- Texte simple + illustrations / captures écran.
- Chaque chapitre = accordion / page courte.
- Lien contextuel depuis l'interface (ex. « ? Comment fixer mes prix → »).

### 28.4 Tooltips & aides contextuelles dans l'interface

| Écran | Élément | Tooltip |
|-------|---------|---------|
| Fiche service (client) | Badge ✅ | « Ce vendeur a vérifié son identité » |
| Fiche service | « Escrow » / 🔒 | « Votre argent est conservé par la plateforme jusqu'à la livraison » |
| Paiement | Acompte | « Payez une partie maintenant, le reste avant la livraison » |
| Commande | Statut HELD | « Les fonds sont bloqués en attendant que vous confirmiez la réception » |
| Vendeur : revenus | Solde disponible | « Montant que vous pouvez retirer maintenant » |
| Vendeur : revenus | Solde en attente | « Montant en cours de protection (commandes non terminées) » |
| Vendeur : création service | Champ prix | « Conseil : regardez les prix des services similaires pour vous positionner » |
| Litige | Délai | « Vous avez 7 jours pour fournir vos preuves » |

---

## 29. États vides, erreurs, aides contextuelles

### 29.1 États vides (empty states)

Chaque liste / dashboard affiche un état vide **humain** avec **illustration** (SVG léger), **message** et **CTA**.

| Contexte | Message | CTA |
|----------|---------|-----|
| Commandes client — vide | « Vous n'avez pas encore passé de commande. Trouvez le service qu'il vous faut ! » | (Parcourir les services) |
| Favoris — vide | « Enregistrez des services pour les retrouver facilement ici. » | (Découvrir les services) |
| Messages — vide | « Aucune conversation. Contactez un vendeur pour démarrer. » | (Rechercher un service) |
| Litiges — vide | « Aucun litige en cours. C'est une bonne nouvelle ! » | — |
| Services vendeur — vide | « Publiez votre premier service et commencez à recevoir des commandes. » | (Créer un service) |
| Commandes vendeur — vide | « Pas encore de commande. Optimisez votre profil et vos services pour attirer des clients. » | (Voir les conseils) |
| Revenus vendeur — vide | « Vos revenus apparaîtront ici après votre première commande complétée. » | — |
| Avis vendeur — vide | « Aucun avis pour le moment. Les clients pourront vous noter après livraison. » | — |
| Recherche — 0 résultats | « Aucun service ne correspond à votre recherche. Essayez d'autres mots-clés ou filtres. » | (Réinitialiser les filtres) |
| Notifications — vide | « Tout est à jour ! Vous serez prévenu ici dès qu'il se passe quelque chose. » | — |

### 29.2 États d'erreur

| Situation | Affichage | Action |
|-----------|-----------|--------|
| Erreur réseau (fetch fail) | Toast rouge : « Impossible de charger les données. Vérifiez votre connexion. » | (Réessayer) |
| Erreur serveur (500) | Page erreur : illustration + « Une erreur est survenue de notre côté. Nous travaillons à la résoudre. » | (Revenir à l'accueil) |
| 404 | Illustration + « Cette page n'existe pas ou a été déplacée. » | (Revenir à l'accueil) |
| Formulaire invalide | Champs erreur en rouge + message sous le champ : « Ce champ est obligatoire » / « Adresse email invalide » | Focus auto sur 1er champ en erreur |
| Upload échoué | Toast + indicateur fichier en erreur : « L'envoi du fichier a échoué. » | (Réessayer l'envoi) |
| Paiement échoué | Écran dédié : « Le paiement n'a pas abouti. Aucun montant n'a été débité. » | (Réessayer le paiement) (Contacter le support) |
| Session expirée | Modal : « Votre session a expiré. Veuillez vous reconnecter. » | (Se reconnecter) |
| Action non autorisée (403) | Toast : « Vous n'avez pas la permission d'effectuer cette action. » | — |
| Rate limit UI | Délai + toast : « Trop de requêtes. Patientez quelques instants. » | Auto-retry après délai |

### 29.3 Feedback de succès

| Action | Feedback |
|--------|----------|
| Message envoyé | Apparaît dans le fil instantanément (optimistic UI) |
| Service publié | Toast vert « Service publié ! Il est maintenant visible. » + redirect liste |
| Commande payée | Écran confirmation : « Paiement confirmé ! Le vendeur a été notifié. » + lien suivi |
| Livraison envoyée (vendeur) | Toast « Livraison envoyée ! Le client a été notifié. » |
| Réception validée (client) | Toast « Merci ! Le paiement sera versé au vendeur. » |
| Retrait demandé | Toast « Demande de retrait enregistrée. Délai de traitement : 24-72h. » |
| Profil mis à jour | Toast « Profil mis à jour. » |

### 29.4 Aides contextuelles complémentaires

- **Bannière d'information** au-dessus du contenu quand pertinent (ex. « Vous n'avez pas encore vérifié votre email. → Renvoyer le lien »).
- **Info-bulles (?)** sur termes techniques ou montants : déclenché par tap (mobile) ou hover (desktop).
- **Callout** dans les formulaires complexes : encart bleu léger avec conseil.
- **Lien « En savoir plus »** renvoyant vers le chapitre correspondant du guide.

---

**Livrables Phase 2 :** ce document (`docs/phase-2-ux-ui.md`), couvrant design system, principes UX, sitemap, wireframes textuels, dashboards, onboarding, tutoriels, états vides/erreurs.

**Prochaine étape recommandée :** Phase 3 — Initialisation projet (setup Next.js, Tailwind, Prisma, lint, env, layout de base, composants UI fondamentaux, seed).
