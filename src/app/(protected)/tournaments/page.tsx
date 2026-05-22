import type { Metadata } from "next";
import { TournamentsView } from "./Tournaments.view";

export const metadata: Metadata = {
  title: "Torneios — PkTracker",
};

export default function TournamentsPage() {
  return <TournamentsView />;
}
