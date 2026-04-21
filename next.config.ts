import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Imagens remotas: permite carregar avatares ou logos externos se necessário.
  // images: { remotePatterns: [{ protocol: "https", hostname: "..." }] },
};

// Sentry wrapper: adiciona upload de source maps no build.
// As variáveis SENTRY_ORG, SENTRY_PROJECT e SENTRY_AUTH_TOKEN precisam estar
// no ambiente de CI/CD (ou .env.sentry-build-plugin) para o upload funcionar.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
});
