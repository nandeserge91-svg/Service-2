import { after } from "next/server";

/**
 * Exécute une tâche après la fin de la requête HTTP (Next.js `after`).
 * Utile pour e-mails et autres I/O lents : libère le client plus tôt.
 *
 * Hors contexte requête (tests, scripts), ou si `after` échoue, la tâche part sur une microfile d’attente Promise (repli).
 */
export function deferAfterResponse(task: () => void | Promise<void>): void {
  try {
    after(() => {
      void Promise.resolve(task()).catch((err) => {
        console.error("[deferAfterResponse]", err);
      });
    });
  } catch {
    void Promise.resolve()
      .then(() => task())
      .catch((err) => {
        console.error("[deferAfterResponse:fallback]", err);
      });
  }
}
