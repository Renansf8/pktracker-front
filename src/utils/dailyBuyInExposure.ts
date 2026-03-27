/** A partir desta fração da banca em buy-ins no dia, exibimos o aviso (6%). */
export const DAILY_BUYIN_WARNING_RATIO = 0.06;

/** Referência mencionada no texto ao usuário (7% da banca em buy-ins no dia). */
export const DAILY_BUYIN_REFERENCE_RATIO = 0.07;

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
 * Buy-in total do dia atingiu pelo menos 6% da banca — mostrar sugestão de cautela.
 */
export function shouldWarnDailyBuyInExposure(
  bankUsd: number,
  todayBuyInUsd: number,
): boolean {
  const r = getDailyBuyInToBankRatio(bankUsd, todayBuyInUsd);
  return r !== null && r >= DAILY_BUYIN_WARNING_RATIO;
}
