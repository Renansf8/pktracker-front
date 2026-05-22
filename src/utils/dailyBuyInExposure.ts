import { DEFAULT_DAILY_BUYIN_LIMIT_PCT } from "./useDailyBuyInLimit";

export function getDailyBuyInToBankRatio(
  bankUsd: number,
  todayBuyInUsd: number,
): number | null {
  if (!Number.isFinite(bankUsd) || bankUsd <= 0) return null;
  if (!Number.isFinite(todayBuyInUsd) || todayBuyInUsd < 0) return null;
  return todayBuyInUsd / bankUsd;
}

export function getWarningRatio(
  limitPct: number = DEFAULT_DAILY_BUYIN_LIMIT_PCT,
): number {
  return (limitPct * 0.85) / 100;
}

export function shouldWarnDailyBuyInExposure(
  bankUsd: number,
  todayBuyInUsd: number,
  limitPct: number = DEFAULT_DAILY_BUYIN_LIMIT_PCT,
): boolean {
  const r = getDailyBuyInToBankRatio(bankUsd, todayBuyInUsd);
  return r !== null && r >= getWarningRatio(limitPct);
}
