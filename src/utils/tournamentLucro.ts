import type { Tournament } from "@/services/hooks/types";

function toN(v: unknown): number {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Lucro líquido na moeda nativa do torneio (result - buyIn), sem conversão.
 * Usar para exibição na tabela: torneios EUR mostram valor em EUR, USD em USD.
 * Importações de grade têm profit=0 no backend, então não usar t.profit diretamente.
 */
export function getTournamentProfitNative(t: Tournament): number {
  return toN(t.result) - toN(t.buyIn);
}

/**
 * Lucro líquido em USD: result - buyIn com conversão EUR→USD quando aplicável.
 * Usar para totais e comparações entre moedas.
 */
export function getTournamentLucroUsd(t: Tournament, eurToUsdRate = 1): number {
  const val = getTournamentProfitNative(t);
  return t.currency === "EUR" ? val * eurToUsdRate : val;
}
