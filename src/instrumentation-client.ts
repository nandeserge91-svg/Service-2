import * as Sentry from "@sentry/nextjs";
import { getBrowserSentryDsn } from "./sentry.shared";

const dsn = getBrowserSentryDsn();
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
