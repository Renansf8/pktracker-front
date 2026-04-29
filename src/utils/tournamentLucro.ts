import type { Tournament } from "@/services/hooks/types";

function toN(v: unknown): number {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Lucro líquido em USD: result - buyIn.
 * Importações de grade criam torneios com profit=0 (ainda não jogado),
 * então usar profit diretamente daria 0 em vez de -buyIn.
 */
export function getTournamentLucroUsd(t: Tournament, eurToUsdRate = 1): number {
  const val = toN(t.result) - toN(t.buyIn);
  return t.currency === "EUR" ? val * eurToUsdRate : val;
}
