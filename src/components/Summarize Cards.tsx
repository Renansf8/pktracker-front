import { ActivityCard } from "./ActivityCard";

interface SummarizeCardsProps {
  totalTournaments: number;
  totalProfit: number;
  totalWinnings: number;
  abi: number;
}

export const SummarizeCards = ({
  totalTournaments,
  totalProfit,
  totalWinnings,
  abi,
}: SummarizeCardsProps) => {
  return (
    <div className="flex gap-4 mt-4 w-full justify-between">
      <ActivityCard title="Torneios jogados" value={totalTournaments} />
      <ActivityCard title="ABI" value={Number(abi.toFixed(2))} />
      <ActivityCard title="Ganhos totais" value={totalProfit} />
      <ActivityCard
        title="Lucro total"
        value={Number(totalWinnings?.toFixed(2))}
        isValuePositiveOrNegative
      />
    </div>
  );
};
