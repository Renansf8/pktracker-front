export const convertUsdToBrl = (usdValue: number): string => {
  // Taxa de conversão fixa (você pode querer tornar isso dinâmico no futuro)

  // Converte o valor
  const brlValue = usdValue;

  // Formata o valor para o padrão brasileiro
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
    BRL: { locale: "pt-BR", currency: "BRL" },
  };

  const format = currencyFormats[currency] || currencyFormats["USD"];

  return value.toLocaleString(format.locale, {
    style: "currency",
    currency: format.currency,
  });
};
