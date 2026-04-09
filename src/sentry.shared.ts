/** DSN Sentry côté serveur / edge (secret optionnel selon hébergeur). */
export function getServerSentryDsn(): string | undefined {
  const a = process.env.SENTRY_DSN?.trim();
  const b = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return a || b || undefined;
}

/** DSN navigateur : uniquement NEXT_PUBLIC_* (jamais SENTRY_DSN seul, pour éviter une fuite involontaire). */
export function getBrowserSentryDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;
}
