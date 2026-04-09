# Conformité, sécurité & journaux (Phase 4.59)

Document opérationnel pour l’équipe produit / technique : limitation d’usage abusif, en-têtes HTTP, rétention des logs et alignement RGPD. **Ce texte ne constitue pas un avis juridique.**

---

## 1. Rate limiting (implémenté)

| Zone | Règle | Implémentation |
|------|--------|----------------|
| Connexion par mot de passe | 10 tentatives / 15 min / IP | `middleware.ts` sur `POST /api/auth/*` contenant `credentials` |
| Inscription (client ou vendeur) | 10 créations / heure / IP | `auth-actions.ts` (`register:*`) |
| Formulaire contact | 5 envois / heure / IP | `contact-actions.ts` (`contact:*`) |

Stockage **en mémoire** du processus Node : adapté à une instance unique ou à un conteneur. En **plusieurs instances** (Kubernetes, plusieurs réplicas), utiliser un stockage partagé (Redis, Upstash) et la même clé logique (`auth:credentials:${ip}`, etc.).

---

## 2. En-têtes de sécurité (`next.config.ts`)

Appliqués à toutes les routes via `headers()` :

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (caméra, micro, géoloc désactivés ; pas de FLoC)
- **Content-Security-Policy** pragmatique (`script-src` sans `unsafe-eval` en production)
- **`Strict-Transport-Security`** : uniquement si `ENABLE_HSTS=1` est défini **au moment du `next build`** (à activer quand **tout** le site est servi en HTTPS)
- **`upgrade-insecure-requests`** dans la CSP : optionnel avec `ENABLE_CSP_UPGRADE=1` (également au build)

Après ajout de **Sentry** ou d’un autre domaine en `connect-src`, mettre à jour la CSP dans `next.config.ts`.

---

## 3. Rétention des logs (recommandations)

| Type de log | Rétention indicative | Remarques |
|-------------|----------------------|-----------|
| Logs d’accès HTTP (reverse proxy, CDN) | 30–90 jours | Suffisant pour debug et incidents |
| Logs applicatifs (stderr / plateforme) | 30–90 jours | Hors obligation légale contraire |
| Données `AuditLog` (métier) | Plus longue | Fraude, litiges, conformité ; voir politique interne |
| Sauvegardes chiffrées | Selon politique interne | Hors site de production |

Documenter la durée réelle dans votre registre des traitements et la politique de confidentialité publique (voir page `/confidentialite`).

---

## 4. RGPD — chantier restant côté produit

- **Registre des traitements** et **analyse d’impact** si traitement à risque.
- **Contrats de sous-traitance (DPA)** avec hébergeur BDD, hébergeur app, SMTP, Chariow, futur Sentry.
- **Transferts hors UE** : clauses contractuelles types ou pays adéquats.
- **Procédure interne** pour les demandes d’accès / effacement (qui répond, délais, preuves).
- **Minimisation** : ne pas logger d’e-mails ou de corps de messages en clair dans les logs applicatifs.

---

## 5. Liens utiles

- Politique publique : `/confidentialite`
- Déploiement : `docs/deploiement.md`
- CNIL (France) : https://www.cnil.fr
