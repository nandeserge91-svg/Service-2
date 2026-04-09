# Phase 5 — Croissance & évolution produit

## 1. Positionnement

La **Phase 4** (jalons 4.38 → 4.63) couvre le **MVP technique** : auth, marketplace, messagerie, commandes, finances internes, paiements Chariow, notifications, admin, SEO, déploiement, conformité, Sentry, e-mails différés.

La **Phase 5** est le **chapitre suivant** : faire **grandir** la plateforme après un ou plusieurs cycles en production, en s’alignant sur la vision **V2 / V3** décrite dans [`phase-0-cadrage-produit.md`](./phase-0-cadrage-produit.md) (sections MVP vs V2 vs V3).

Ce document **ne remplace pas** une roadmap commerciale détaillée : il fixe les **domaines**, les **dépendances techniques** et des **jalons possibles** (5.1, 5.2, …) à prioriser selon les retours terrain.

---

## 2. Fermeture du socle Phase 4 (recommandé avant d’accélérer la 5)

| Jalon | Sujet | Rôle |
|-------|--------|------|
| **4.64** (optionnel) | **i18n** (ex. EN sur pages publiques + shell dashboard) | Aligné V2 « i18n EN + second pays » |
| **4.64** (optionnel) | **Queue durable** (Redis / worker / SaaS) pour e-mails & jobs | Fiabilité au-delà de `after()` |
| **4.64** (optionnel) | **Paiements / Chariow** : durcissement prod, monitoring webhooks | Si le go-live réel est postérieur au code actuel |

Ces points peuvent être traités **en parallèle** de premiers chantiers Phase 5 si le risque métier l’impose.

---

## 3. Piliers Phase 5 (domaines)

### 3.1 Confiance, conformité avancée, fraude

- KYC / vérifications vendeur **progressives** (Phase 0 V2).
- Règles anti-fraude simples → score ou signaux (V2/V3).
- Modération enrichie, SLA support **affiché** où pertinent (V2+).
- Mise à jour **registre traitements / sous-traitants** (Sentry, PSP, hébergeur) dans la continuité de [`conformite-et-logs.md`](./conformite-et-logs.md).

### 3.2 Monétisation & paiements

- Coupons, parrainage (V2).
- **Multi-devises** et **moyens locaux** additionnels (V3) — impact schema, ledger, UX prix.
- Abonnements / boost visibilité vendeur (V3).

### 3.3 Expérience utilisateur & acquisition

- **PWA** / installabilité, push (si pertinent au marché cible).
- Recommandations, comparaison de services, centre de notifications unifié (V2).
- Blog / CMS léger (V3).

### 3.4 Internationalisation & marchés

- Locales **EN** puis autres langues ; SEO hreflang ; contenus éditoriaux traduits ou gérés par CMS.
- « Second pays » : règles fiscales, PSP, mentions légales — hors simple traduction.

### 3.5 Plateforme technique & opérations

- **Files durables**, workers, idempotence renforcée sur tous les effets de bord.
- Observabilité : dashboards Sentry + métriques métier (conversion, litiges, temps de paiement).
- **Feature flags** côté serveur (déjà amorcé en 4.61) étendus ou branchés sur un fournisseur si besoin.

---

## 4. Jalons indicatifs (à renuméroter selon priorité métier)

| Jalon | Thème | Exemples de livrables |
|-------|--------|------------------------|
| **5.1** | Fiabilité & scale | Queue e-mails/jobs, limites rate prod multi-instances (Redis), revue perf DB |
| **5.2** | i18n & SEO international | `next-intl` ou équivalent, `/en`, contenus clés |
| **5.3** | Confiance V2 | KYC vendeur minimal, badges, règles litige / délais affichés |
| **5.4** | Monétisation V2 | Coupons ou parrainage (schéma + flux + admin) |
| **5.5** | Mobile / PWA | Manifest, offline partiel, optimisations tactile |
| **5.6** | V3 pilotes | Abonnement vendeur, intégration paiement locale #2, CMS blog |

Les numéros **5.x** sont **indicatifs** : l’ordre réel dépend du pays, du canal d’acquisition et des contraintes légales.

---

## 5. Critères de priorisation (rappel)

1. **Sécurité / conformité / argent** (paiements, données, litiges).
2. **Réduction du churn** (onboarding vendeur, clarté statuts, support).
3. **Leviers de croissance mesurables** (SEO, parrainage, nouveaux moyens de paiement).
4. **Dette technique** uniquement quand elle **bloque** un objectif ci-dessus.

---

## 6. Risques

- **Scope V2+V3 en un bloc** → découper en releases **5.x** testables et documentées dans [`RELEASE_NOTES.md`](./RELEASE_NOTES.md).
- **i18n tardive** → coût de refactor des chaînes et des e-mails ; traiter tôt si l’EN est un objectif 12 mois.
- **Multi-PSP / multi-devises** → tests comptables (ledger) et juridiques avant tout flag « prod ».

---

## 7. Livrables Phase 5 (documentation)

- **Ce document** : cadrage et carte des chantiers.
- Mises à jour **`phase-4-developpement.md`** : une fois un jalon 5.x entamé, y ajouter une section dédiée (comme pour la Phase 4) ou créer **`phase-5-developpement.md`** si le volume le justifie.
- **`ARBORESCENCE.md`** : refléter les nouveaux modules au fil des implémentations.

---

**Prochaine action concrète :** choisir **un** premier jalon (souvent **5.1 fiabilité** ou **5.2 i18n**), le détailler en tickets (critères d’acceptation, maquettes, migrations), puis l’implémenter — en fermant au besoin le **4.64** technique associé.
