/**
 * Limiteur glissant en mémoire (processus unique).
 * En production multi-instances, préférer Redis / Upstash (voir docs/conformite-et-logs.md).
 */

const store = new Map<string, { count: number; resetAt: number }>();

const PRUNE_THRESHOLD = 10_000;

function prune(now: number) {
  for (const [k, v] of store) {
    if (now >= v.resetAt) store.delete(k);
  }
}

/**
 * @returns true si la requête est autorisée, false si la limite est dépassée
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    if (store.size > PRUNE_THRESHOLD) prune(now);
    return true;
  }

  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

/** Tests uniquement */
export function __resetRateLimitStoreForTests() {
  store.clear();
}
