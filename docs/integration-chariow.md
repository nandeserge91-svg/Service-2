# Intégration Chariow — faits documentaires et implications

Référence : [documentation Chariow](https://chariow.dev/llms.txt) (overview, authentication, checkout, sales, pulses, rate limits).

## Ce que Chariow est (selon la doc)

- Plateforme **e-commerce produits numériques** (fichiers, cours, licences, bundles).
- API REST `https://api.chariow.com/v1`, réponses JSON homogènes (`message`, `data`, `errors`).
- Pagination **curseur** (`cursor`, `per_page`, `next_cursor`, `has_more`).

## Authentification

- Clé API dans `Authorization: Bearer <KEY>`.
- **Jamais** côté client : appels serveur uniquement.
- Erreur typique : `401` si clé absente/invalide.

## Checkout API

- `POST /v1/checkout` : session d’achat ; redirection vers `checkout_url` si `step: payment`.
- **Non pris en charge via l’API publique** : produits type **Service**, **Coaching**, **pay-what-you-want** → redirection boutique Chariow ou **Snap Widget**.
- Types supportés API : downloadable, course, license, bundle.
- Répétition d’achat : **License** = toujours autorisé ; downloadable/course/bundle = bloqué si accès actif (`already_purchased`).
- Métadonnées : `custom_metadata` max **10 clés**, valeurs **255 caractères** ; incluses dans les **Pulses**.
- `payment_currency` ISO 4217 possible (conversion côté Chariow).

## Ventes (Sales)

- Statuts vente : `awaiting_payment`, `completed`, `failed`, `abandoned`, `settled`.
- Statuts paiement : `initiated`, `pending`, `success`, `failed`, `cancelled`.
- Canal `api` pour ventes créées via API.
- **Settlement** décrit le versement **marchand Chariow** (net, frais plateforme Chariow), pas un **wallet vendeur marketplace multi-tiers**.

## Webhooks (Pulses)

- HTTPS obligatoire ; retry 1 min → 5 min → 30 min → 2 h → 24 h (5 essais).
- Événements vente : `successful.sale`, `abandoned.sale`, `failed.sale`.
- Réponse **2xx** rapide ; traitement long en file d’attente ; **idempotence** (duplicatas retries).

## Rate limiting

- Doc overview / authentication : **100 requêtes/minute** par clé API ; `429` + en-têtes `X-RateLimit-*` ; backoff exponentiel, files, cache, privilégier webhooks vs polling.

## Limites pour une marketplace services + escrow

| Besoin produit | Couverture Chariow native |
|----------------|---------------------------|
| Paiement carte/mobile money via passerelle Chariow | Oui (flux checkout → sale) |
| Produits « service marketplace » via API checkout | **Non** (Service/Coaching hors API) |
| Escrow jusqu’à validation client | **Non** (modèle vente digitale / règlement marchand) |
| Wallet vendeur interne + ledger | **Non** |
| Acompte + solde + paiement différé | **Non** comme primitives marketplace |
| Multi-vendeurs sur une même « commande » | **Non** |
| Litige / gel / libération conditionnelle | **Non** |

## Stratégie recommandée pour ce projet

1. **Cœur financier dans PostgreSQL** : wallets logiques, ledger append-only, états d’escrow, liens `chariow_sale_id` / `transaction_id` pour preuve et rapprochement.
2. **Chariow comme acquéreur** : une encaisse = une (ou plusieurs) ventes Chariow alignées sur des montants figés au moment du paiement, avec `custom_metadata` (`internal_order_id`, `payment_leg`, `buyer_id`).
3. **Contour API « Service »** : soit produits Chariow type **License** (achats répétés autorisés) comme proxy de « droit de commande payée », soit **Snap Widget / boutique** pour cas non couverts — à trancher avec conformité Chariow et UX.
4. **Commission plateforme** : calcul et ventilation **côté ledger** après confirmation de paiement (pas d’attente d’une fonction « split marketplace » dans la doc lue).
5. **Retraits vendeurs** : processus **interne** (virement, mobile money, partenaire) avec états `REQUESTED` → `APPROVED` → `PAID` et audit.

Ce document sera mis à jour si Chariow publie des capacités marketplace / split / escrow documentées.
