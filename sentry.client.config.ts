/**
 * Sentry — configuração do client.
 * Carregado automaticamente pelo Next no bundle do navegador.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Taxa de amostragem de tracing (performance). Ajuste conforme a necessidade.
  tracesSampleRate: 1.0,

  // Session Replay: captura interações do usuário para reprodução de erros.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Integrações do browser (Replay, BrowserTracing já vêm por padrão).
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Envia PII (IP, user-agent) automaticamente. Equivale ao `sendDefaultPii: true`
  // que estava no setup anterior com @sentry/react.
  sendDefaultPii: true,
});
