import type { Metadata } from "next";
import { ScheduleView } from "./Schedule.view";

export const metadata: Metadata = {
  title: "Grade — PkTracker",
};

export default function SchedulePage() {
  return <ScheduleView />;
}
