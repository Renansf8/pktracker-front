import type { Metadata } from "next";
import { InsightsView } from "./Insights.view";

export const metadata: Metadata = {
  title: "Insights — PkTracker",
};

export default function InsightsPage() {
  return <InsightsView />;
}
