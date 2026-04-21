import type { Metadata } from "next";
import { TournamentsView } from "./Tournaments.view";

export const metadata: Metadata = {
  title: "Torneios — PkTracker",
};

/**
 * Entry point da rota /tournaments.
 *
 * Server Component: só delega a renderização para a View ("use client"),
 * que por sua vez instancia o ViewModel com toda a lógica interativa
 * (paginação, filtros, edição inline, import da grade, etc.).
 */
export default function TournamentsPage() {
  return <TournamentsView />;
}
