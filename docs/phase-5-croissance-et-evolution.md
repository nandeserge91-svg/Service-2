# Phase 5 — Croissance & évolution produit

## 1. Positionnement

La **Phase 4** (jalons 4.38 → 4.64) couvre le **MVP technique** : auth, marketplace, messagerie, commandes, finances internes, paiements Chariow, notifications, admin, SEO, déploiement, conformité, Sentry, e-mails différés, i18n shell, outbox PostgreSQL.

La **Phase 5** est le **chapitre suivant** : faire **grandir** la plateforme après un ou plusieurs cycles en production, en s'alignant sur la vision **V2 / V3** décrite dans [`phase-0-cadrage-produit.md`](./phase-0-cadrage-produit.md) (sections MVP vs V2 vs V3).

Ce document **ne remplace pas** une roadmap commerciale détaillée : il fixe les **domaines**, les **dépendances techniques** et des **jalons possibles** (5.1, 5.2, …) à prioriser selon les retours terrain.

---

## 2. Fermeture du socle Phase 4 (terminé ✅)

| Jalon | Sujet | Statut |
|-------|--------|--------|
| **4.64** | **i18n** (EN sur pages publiques + shell dashboard) | ✅ Terminé |
| **4.64** | **Queue durable** (PostgreSQL outbox pour e-mails & jobs) | ✅ Terminé |
| **4.64** | **Paiements / Chariow** : webhook idempotent, simulation dev | ✅ Terminé |

Tous les prérequis Phase 4 sont clôturés.

---

## 3. Piliers Phase 5 (domaines)

### 3.1 Confiance, conformité avancée, fraude

- ✅ KYC / vérifications vendeur **progressives** (Phase 0 V2) — **implémenté 5.3**.
- Règles anti-fraude simples → score ou signaux (V2/V3).
- Modération enrichie, SLA support **affiché** où pertinent (V2+).
- Mise à jour **registre traitements / sous-traitants** (Sentry, PSP, hébergeur) dans la continuité de [`conformite-et-logs.md`](./conformite-et-logs.md).

### 3.2 Monétisation & paiements

- ✅ Coupons (V2) — **implémenté 5.4**.
- Parrainage (V2) — à implémenter.
- **Multi-devises** et **moyens locaux** additionnels (V3) — impact schema, ledger, UX prix.
- Abonnements / boost visibilité vendeur (V3).

### 3.3 Expérience utilisateur & acquisition

- ✅ **PWA** / installabilité — **implémenté 5.5** (manifest, meta, layout).
- Push notifications (si pertinent au marché cible).
- Recommandations, comparaison de services, centre de notifications unifié (V2).
- Blog / CMS léger (V3).

### 3.4 Internationalisation & marchés

- ✅ Locales **EN** pages publiques — **implémenté 5.2** (Home, About, Contact, Search, Services, shell).
- SEO hreflang ; contenus éditoriaux traduits ou gérés par CMS.
- « Second pays » : règles fiscales, PSP, mentions légales — hors simple traduction.

### 3.5 Plateforme technique & opérations

- ✅ **Files durables** (PostgreSQL outbox — Phase 4.64).
- Observabilité : dashboards Sentry + métriques métier (conversion, litiges, temps de paiement).
- **Feature flags** côté serveur (déjà amorcé en 4.61) étendus ou branchés sur un fournisseur si besoin.

---

## 4. Jalons et statut

| Jalon | Thème | Statut | Livrables |
|-------|--------|--------|-----------|
| **5.1** | Fiabilité & scale | ✅ (via 4.64) | Queue PostgreSQL outbox, rate limit mémoire |
| **5.2** | i18n & SEO international | ✅ Terminé | `next-intl` 6 namespaces (Home, About, Contact, Search, Services, shell), cookie `NEXT_LOCALE`, ICU pluriels |
| **5.3** | Confiance V2 | ✅ Terminé | KYC vendeur (soumission + admin review + notification + badge), champs `kycDocumentUrl`/`kycNote` |
| **5.4** | Monétisation V2 | ✅ Terminé | Modèle `Coupon`, `discountMinor`/`couponId` sur `Order`, validation checkout, admin CRUD |
| **5.5** | Mobile / PWA | ✅ Terminé | `manifest.json`, metadata `manifest` + `appleWebApp`, icônes placeholder |
| **5.6** | V3 pilotes | 🔜 À planifier | Abonnement vendeur, intégration paiement locale #2, CMS blog |

---

## 5. Critères de priorisation (rappel)

1. **Sécurité / conformité / argent** (paiements, données, litiges).
2. **Réduction du churn** (onboarding vendeur, clarté statuts, support).
3. **Leviers de croissance mesurables** (SEO, parrainage, nouveaux moyens de paiement).
4. **Dette technique** uniquement quand elle **bloque** un objectif ci-dessus.

---

## 6. Risques

- **Scope V2+V3 en un bloc** → découper en releases **5.x** testables et documentées dans [`RELEASE_NOTES.md`](./RELEASE_NOTES.md).
- **i18n tardive** → coût de refactor des chaînes et des e-mails ; traiter tôt si l'EN est un objectif 12 mois.
- **Multi-PSP / multi-devises** → tests comptables (ledger) et juridiques avant tout flag « prod ».

---

## 7. Livrables Phase 5 (documentation)

- **Ce document** : cadrage et carte des chantiers (mis à jour avec statuts).
- **`ARBORESCENCE.md`** : reflet des nouveaux modules (kyc, coupons, manifest, traductions).
- **`RELEASE_NOTES.md`** : entrées 5.2, 5.3, 5.4, 5.5.

---

**Prochaine action concrète :** le jalon **5.6** (V3 pilotes : abonnement vendeur, parrainage, intégration paiement locale #2, CMS blog) est le prochain chantier significatif. Alternativement, étendre l'i18n aux e-mails et pages dashboard, ou implémenter le parrainage.
