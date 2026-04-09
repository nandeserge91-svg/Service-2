"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Une erreur inattendue s’est produite</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Vous pouvez réessayer ou retourner à l’accueil. Si le problème persiste, contactez le support.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Retour à l’accueil
        </Link>
      </body>
    </html>
  );
}
