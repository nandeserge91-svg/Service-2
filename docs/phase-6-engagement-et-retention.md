# Phase 6 — Engagement & Rétention

## 1. Positionnement

La **Phase 5** a couvert les pilotes V3 (abonnements, parrainage, blog, PWA, i18n, KYC, coupons). La **Phase 6** se concentre sur **l'engagement utilisateur** et la **rétention** : notifications push, centre unifié, recommandations, i18n étendue, relances automatiques.

---

## 2. Jalons et statut

| Jalon | Thème | Statut | Livrables |
|-------|--------|--------|-----------|
| **6.1** | Push notifications | ✅ Terminé | `PushSubscription`, `sw.js`, VAPID `web-push`, toggle header, intégration `notify()` |
| **6.2** | Centre notifications unifié | ✅ Terminé | API enrichie (filtres status/search), centre notifications groupé par date, icônes catégorie |
| **6.3** | Recommandations & comparaison | ✅ Terminé | `SimilarServices` sur fiche service, page `/comparer?ids=`, `recommendation-actions.ts` |
| **6.4** | i18n étendue | ✅ Terminé | hreflang alternates, `getUserLocale()` e-mails, sidebar dashboard FR/EN, namespace `Dashboard` |
| **6.5** | Relances automatiques | ✅ Terminé | Cron `/api/cron/reminders` : commandes abandonnées (24h), messages non lus (48h), avis manquants (3j) |

---

**La Phase 6 est entièrement terminée** (jalons 6.1 → 6.5). Les axes restants : Phase 7 (sécurité & observabilité), Phase 8 (scale & international).
