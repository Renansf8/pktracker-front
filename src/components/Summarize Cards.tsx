import { convertUsdToBrl } from "@/utils/currencyConvert";
import { ActivityCard } from "./ActivityCard";
import { useCurrency } from "@/services/hooks/useCurrency";

interface SummarizeCardsProps {
  totalTournaments: number;
  totalProfit: number;
  totalWinnings: number;
  abi: number;
  totalBuyIn: number;
  cardVariant?: "elevated" | "nested";
}

export const SummarizeCards = ({
  totalTournaments,
  totalProfit,
  totalWinnings,
  abi,
  totalBuyIn,
  cardVariant = "elevated",
}: SummarizeCardsProps) => {
  const { currencies } = useCurrency();
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
      <ActivityCard
        title="Ganhos totais"
        value={Number(totalProfit?.toFixed(2))}
        isCurrency
        variant={cardVariant}
      />
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
    </div>
  );
};
