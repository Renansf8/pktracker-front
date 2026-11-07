import type { DashboardValueUnit } from "@/services/hooks/genui.types";

export const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", BRL: "R$" };

export function formatValue(value: number | null, unit: DashboardValueUnit): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (unit === "money") return `$ ${value.toFixed(2)}`;
  if (unit === "percent") return `${value.toFixed(1)}%`;
  return String(Math.round(value));
}

/** Tailwind text color class: green for gains, red for losses, neutral for counts. */
export function valueTone(value: number | null, unit: DashboardValueUnit) {
  if (value === null || unit === "count") return "text-text-primary";
  if (value > 0) return "text-green-500";
  if (value < 0) return "text-red-500";
  return "text-text-primary";
}

/** YYYY-MM-DD (or ISO datetime) -> DD/MM/YYYY */
export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
