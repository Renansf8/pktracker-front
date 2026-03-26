/** Buy-ins comuns em MTTs online (USD), ordem crescente */
const COMMON_STAKES_USD = [
  1, 2, 2.2, 3.3, 5.5, 8.8, 11, 16.5, 22, 33, 55, 109,
] as const;

export type AbiSuggestedRange = { min: number; max: number };

/**
 * Regra 100–150 buy-ins: ABI máximo = banca/100, mínimo = banca/150
 * (faixa “ideal” para equilíbrio entre proteção e crescimento).
 */
export function getAbiSuggestedRange(bankUsd: number): AbiSuggestedRange | null {
  if (!Number.isFinite(bankUsd) || bankUsd <= 0) {
    return null;
  }
  return {
    min: bankUsd / 150,
    max: bankUsd / 100,
  };
}

export type StakePair = { low: number; high: number };

/**
 * Escolhe dois níveis de buy-in próximos à faixa de ABI (base comum em grinders).
 */
export function getSuggestedStakeLevels(
  abiMin: number,
  abiMax: number,
): StakePair {
  const low =
    [...COMMON_STAKES_USD]
      .reverse()
      .find((s) => s <= abiMin * 1.02) ?? COMMON_STAKES_USD[0];

  const targetHigh = Math.min(abiMax * 1.85, abiMin * 2.1);
  const high =
    COMMON_STAKES_USD.find((s) => s >= targetHigh * 0.88) ??
    COMMON_STAKES_USD.find((s) => s > abiMin) ??
    abiMax;

  return { low, high };
}
