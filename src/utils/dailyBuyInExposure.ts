import { DEFAULT_DAILY_BUYIN_LIMIT_PCT } from "./useDailyBuyInLimit";

/**
 * Retorna a razão buy-in do dia / banca, ou null se inválido.
 */
export function getDailyBuyInToBankRatio(
  bankUsd: number,
  todayBuyInUsd: number,
): number | null {
  if (!Number.isFinite(bankUsd) || bankUsd <= 0) return null;
  if (!Number.isFinite(todayBuyInUsd) || todayBuyInUsd < 0) return null;
  return todayBuyInUsd / bankUsd;
}

/**
 * Limiar de aviso: 85% do limite configurado pelo usuário.
 * Ex.: limite 7% → aviso a partir de 5,95%.
 */
export function getWarningRatio(limitPct: number = DEFAULT_DAILY_BUYIN_LIMIT_PCT): number {
  return (limitPct * 0.85) / 100;
}

/**
 * Buy-in total do dia atingiu o limiar de aviso — mostrar sugestão de cautela.
 */
export function shouldWarnDailyBuyInExposure(
  bankUsd: number,
  todayBuyInUsd: number,
  limitPct: number = DEFAULT_DAILY_BUYIN_LIMIT_PCT,
): boolean {
  const r = getDailyBuyInToBankRatio(bankUsd, todayBuyInUsd);
  return r !== null && r >= getWarningRatio(limitPct);
}
