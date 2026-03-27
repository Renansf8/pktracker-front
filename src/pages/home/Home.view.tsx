import { PlayerSuggestions } from "@/components/PlayerSuggestions";
import { SummarizeCards } from "@/components/Summarize Cards";
import { SummarizeResults } from "@/components/SummarizeResults";
import type { HomeViewProps } from "./home.types";

export function HomeView({
  isLoading,
  userName,
  bankDisplayText,
  bankUsd,
  todayTotalBuyIn,
  totalTournaments,
  totalBuyIn,
  abi,
  totalProfit,
  totalWinnings,
}: HomeViewProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col justify-center w-[90%] mx-auto mt-8">
        <p className="text-text-primary">Fala, {userName}</p>
        <p className="text-text-primary">
          Banca: <b>{bankDisplayText}</b>
        </p>
        <SummarizeCards
          totalTournaments={totalTournaments}
          totalProfit={totalProfit}
          totalWinnings={totalWinnings}
          abi={abi}
          totalBuyIn={totalBuyIn}
        />
        <PlayerSuggestions
          bankUsd={bankUsd}
          todayTotalBuyIn={todayTotalBuyIn}
        />
        <SummarizeResults />
      </div>
    </div>
  );
}
