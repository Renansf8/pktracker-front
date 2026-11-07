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
  // As telas mostram dados financeiros e e-mail do jogador: o Replay grava a
  // estrutura da página com todo texto, campo e mídia mascarados.
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],

  // Não envia PII (IP, cookies, dados do usuário) para o Sentry.
  sendDefaultPii: false,
});
