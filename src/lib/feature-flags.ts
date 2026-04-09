/**
 * Feature flags côté serveur (Phase 4.61).
 *
 * Convention : `FEATURE_<NOM_EN_SNAKE_UPPER>=1|true|yes`
 * Exemple : `FEATURE_BETA_SELLER_ANALYTICS=1`
 *
 * Ne pas exposer de secrets via ces variables : elles peuvent apparaître dans les bundles
 * si utilisées dans du code partagé ; limiter l’usage aux server components, actions et routes API.
 */
export function serverFeatureEnabled(flag: string): boolean {
  const normalized = flag.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  if (!normalized) return false;
  const key = `FEATURE_${normalized}`;
  const v = process.env[key]?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
