/**
 * src/app/(protected)/page.tsx
 * ---------------------------------------------------------------------------
 * Entry point da rota "/" (Home). Server Component.
 *
 * O layout pai (`(protected)/layout.tsx`) já busca o user via `serverFetch`
 * e renderiza o NavBar. Este page só precisa devolver a View.
 *
 * No futuro dá pra pré-carregar aqui `tournaments` via `serverFetch` e
 * hidratar o TanStack Query com `HydrationBoundary`, evitando o flicker
 * inicial. Por agora, mantemos simples.
 */
import type { Metadata } from "next";
import { HomeView } from "./Home.view";

export const metadata: Metadata = {
  title: "Dashboard — PkTracker",
};

export default function HomePage() {
  return <HomeView />;
}
