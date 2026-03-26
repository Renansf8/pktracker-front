import type { Tournament } from "@/services/hooks/types";

/**
 * Lucro em USD alinhado à coluna Profit da tabela e ao card "Lucro total".
 * A API pode preencher `profit` e deixar `result` como 0 — `??` em `result ?? profit`
 * não cobre esse caso.
 */
export function getTournamentLucroUsd(t: Tournament): number {
  const raw = t.profit ?? t.result;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
