/**
 * Sentry — configuração do Edge runtime (usado pelo middleware.ts e por
 * Route Handlers configurados como `export const runtime = "edge"`).
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
