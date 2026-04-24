"use client";

import { convertUsdToBrl } from "@/utils/currencyConvert";
import { ActivityCard } from "./ActivityCard";
import { useCurrency } from "@/services/hooks/useCurrency";

interface SummarizeCardsProps {
  totalTournaments: number;
  totalProfit: number;
  totalWinnings: number;
  abi: number;
  totalBuyIn: number;
  itmPercentage?: number;
  itmCount?: number;
  ftCount?: number;
  avgDailyBuyIn?: number;
  cardVariant?: "elevated" | "nested";
  twoRows?: boolean;
}

export const SummarizeCards = ({
  totalTournaments,
  totalProfit,
  totalWinnings,
  abi,
  totalBuyIn,
  itmPercentage,
  itmCount,
  ftCount,
  avgDailyBuyIn,
  cardVariant = "elevated",
  twoRows = false,
}: SummarizeCardsProps) => {
  const { currencies } = useCurrency();

  const lucroTotalCard = (
    <ActivityCard
      title="Lucro total"
      value={Number(totalWinnings?.toFixed(2))}
      isValuePositiveOrNegative
      variant={cardVariant}
      convertedValue={
        currencies?.data?.rates?.BRL !== undefined
          ? convertUsdToBrl(currencies.data.rates.BRL * totalWinnings)
          : "0.00"
      }
    />
  );

  if (twoRows) {
    return (
      <div className="flex flex-col gap-4 mt-4 w-full">
        <div className="flex gap-4 w-full">
          <ActivityCard
            title="Torneios jogados"
            value={totalTournaments}
            variant={cardVariant}
          />
          <ActivityCard
            title="ABI"
            value={Number(abi?.toFixed(2))}
            variant={cardVariant}
          />
          <ActivityCard
            title="Buy In total"
            value={Number(totalBuyIn?.toFixed(2))}
            isCurrency
            variant={cardVariant}
          />
        </div>
        <div className="flex gap-4 w-full">
          {itmPercentage !== undefined && (
            <ActivityCard
              title="% ITM"
              value={Number(itmPercentage.toFixed(1))}
              suffix={`% (${itmCount ?? 0} torneios)`}
              variant={cardVariant}
            />
          )}
          <ActivityCard
            title="Ganhos totais"
            value={Number(totalProfit?.toFixed(2))}
            isCurrency
            variant={cardVariant}
          />
          {lucroTotalCard}
        </div>
        <div className="flex gap-4 w-full">
          <ActivityCard
            title="Média de Buy-ins/dia"
            value={Number((avgDailyBuyIn ?? 0).toFixed(2))}
            isCurrency
            variant={cardVariant}
          />
          <ActivityCard
            title="Final Tables"
            value={ftCount ?? 0}
            variant={cardVariant}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mt-4 w-full justify-between">
      <ActivityCard
        title="Torneios jogados"
        value={totalTournaments}
        variant={cardVariant}
      />
      <ActivityCard
        title="ABI"
        value={Number(abi?.toFixed(2))}
        variant={cardVariant}
      />
      <ActivityCard
        title="Buy In total"
        value={Number(totalBuyIn?.toFixed(2))}
        isCurrency
        variant={cardVariant}
      />
      {itmPercentage !== undefined && (
        <ActivityCard
          title="% ITM"
          value={Number(itmPercentage.toFixed(1))}
          suffix="%"
          variant={cardVariant}
        />
      )}
      <ActivityCard
        title="Ganhos totais"
        value={Number(totalProfit?.toFixed(2))}
        isCurrency
        variant={cardVariant}
      />
      {lucroTotalCard}
    </div>
  );
};
