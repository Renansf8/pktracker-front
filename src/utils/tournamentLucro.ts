import type { Tournament } from "@/services/hooks/types";

/**
 * Lucro em USD alinhado à coluna Profit da tabela e ao card "Lucro total".
 * A API pode preencher `profit` e deixar `result` como 0 — `??` em `result ?? profit`
 * não cobre esse caso.
 */
export function getTournamentLucroUsd(t: Tournament, eurToUsdRate = 1): number {
  const raw = t.profit ?? t.result;
  const n = Number(raw);
  const val = Number.isFinite(n) ? n : 0;
  return t.currency === "EUR" ? val * eurToUsdRate : val;
}
