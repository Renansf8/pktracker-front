/**
 * src/app/layout.tsx
 * ---------------------------------------------------------------------------
 * Root layout — o HTML "envelope" de toda a aplicação.
 *
 * Este arquivo substitui o antigo `index.html` + `main.tsx` do Vite. No App
 * Router, o arquivo `layout.tsx` mais alto na hierarquia é obrigatório e
 * precisa exportar uma função default que retorna <html> e <body>.
 *
 * Por padrão é Server Component — pode renderizar sem JS, ler cookies,
 * fazer fetch server-side no futuro, etc. Mantemos ele "burro" (só estrutura
 * + metadata + fontes) e delegamos estado do client para `<Providers>`.
 *
 * Fontes:
 *   Usamos `next/font/google` em vez do <link> do Google Fonts anterior.
 *   Vantagens:
 *     - Next faz download no BUILD time e self-hospeda (zero chamada
 *       de rede no runtime → evita FOIT/FOUT).
 *     - As fontes entram em um <style> inline automático com `font-display`
 *       ajustado para evitar flash de texto invisível.
 *     - O `variable` expõe a família via CSS variable (ex: --font-syne),
 *       consumida por `@theme` em `globals.css`.
 */
import type { Metadata } from "next";
import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PkTracker",
  description: "Acompanhe seus resultados de torneios de poker",
  // Aqui dá para adicionar open graph, favicon, theme-color etc. mais tarde.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${syne.variable} ${jetbrains.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
