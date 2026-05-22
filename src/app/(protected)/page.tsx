import type { Metadata } from "next";
import { HomeView } from "./Home.view";

export const metadata: Metadata = {
  title: "Dashboard — PkTracker",
};

export default function HomePage() {
  return <HomeView />;
}
