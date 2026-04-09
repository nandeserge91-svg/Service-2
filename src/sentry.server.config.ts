import * as Sentry from "@sentry/nextjs";
import { getServerSentryDsn } from "./sentry.shared";

const dsn = getServerSentryDsn();
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
  });
}
