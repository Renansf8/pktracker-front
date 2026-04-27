export const convertUsdToBrl = (usdValue: number): string => {
  const brlValue = usdValue;
  return brlValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatCurrency = (value: number, currency: string): string => {
  const currencyFormats: {
    [key: string]: { locale: string; currency: string };
  } = {
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "de-DE", currency: "EUR" },
    BRL: { locale: "pt-BR", currency: "BRL" },
  };

  const format = currencyFormats[currency] || currencyFormats["USD"];

  return value.toLocaleString(format.locale, {
    style: "currency",
    currency: format.currency,
  });
};

/**
 * Retorna o rate EUR→USD a partir do objeto de rates da fxratesapi.
 * A API usa base USD, então rates.EUR ≈ 0.92 (EUR por 1 USD).
 * Para obter USD por 1 EUR: 1 / rates.EUR.
 * Fallback de 1 caso a API ainda não tenha carregado.
 */
export function getEurToUsdRate(rates: Record<string, number> | undefined): number {
  if (!rates?.EUR) return 1;
  return 1 / rates.EUR;
}

/**
 * Converte um valor monetário para USD.
 * Se já for USD (ou moeda desconhecida), retorna o valor inalterado.
 */
export function toUsd(
  value: number,
  currency: string,
  eurToUsdRate: number,
): number {
  if (currency === "EUR") return value * eurToUsdRate;
  return value;
}
