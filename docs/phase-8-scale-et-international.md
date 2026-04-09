# Phase 8 — Scale & International

## 1. Positionnement

La **Phase 7** a renforcé la sécurité et l'observabilité (anti-fraude, modération, métriques, feature flags DB). La **Phase 8** prépare le **passage à l'échelle** et l'**expansion internationale** : multi-devises, second fournisseur de paiement, configuration multi-pays, et exports comptables.

---

## 2. Jalons et statut

| Jalon | Thème | Statut | Livrables |
|-------|--------|--------|-----------|
| **8.1** | Multi-devises | ✅ Terminé | `ExchangeRate` (taux base/cible, validité, source), `SupportedCurrency` (code, symbole, noms FR/EN), `convertAmount()`, admin CRUD `/devises` |
| **8.2** | Paiement local #2 | ✅ Terminé | `PaymentProvider` (slug, devises, pays, config), `payment-routing.ts` (routage auto par pays/devise), Orange Money (API stub + webhook), admin `/fournisseurs-paiement` |
| **8.3** | Multi-pays | ✅ Terminé | `CountryConfig` (devise par défaut, fournisseurs, fuseau, taxe), admin CRUD `/pays`, `country-actions.ts` |
| **8.4** | Export comptable | ✅ Terminé | `exportTransactionsCSV()` et `exportCommissionsCSV()` (filtres période, max 10K lignes), page admin `/exports` avec téléchargement client-side |

---

## 3. Architecture paiement

```
Acheteur → createPaymentSession()
            ↓
    resolveProvider(currency, countryCode)
            ↓
    ┌───────────────────┐
    │ chariow (défaut)  │ → Chariow Checkout API
    │ orange_money      │ → Orange Money WebPay API
    │ (futur: mtn_momo) │ → à implémenter
    └───────────────────┘
            ↓
    Webhook → confirmPayment() / failPayment()
```

- Le routage est **configurable** via `CountryConfig.providers` et `PaymentProvider.currencies`.
- En dev (pas de clé API), tous les providers redirigent vers `/paiement/simulation`.

---

**La Phase 8 est entièrement terminée** (jalons 8.1 → 8.4).
