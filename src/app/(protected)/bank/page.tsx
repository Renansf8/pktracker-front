import type { Metadata } from "next";
import { BankView } from "./Bank.view";

export const metadata: Metadata = {
  title: "Banca — PkTracker",
};

export default function BankPage() {
  return <BankView />;
}
