import type { Metadata } from "next";
import { StatsView } from "./Stats.view";

export const metadata: Metadata = {
  title: "Estatísticas — PkTracker",
};

export default function StatsPage() {
  return <StatsView />;
}
