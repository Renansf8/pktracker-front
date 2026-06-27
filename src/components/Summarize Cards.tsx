"use client";

import { useState } from "react";
import { convertUsdToBrl } from "@/utils/currencyConvert";
import type { Tournament } from "@/services/hooks/types";
import { ActivityCard } from "./ActivityCard";
import { PodiumCard } from "./PodiumCard";
import { TournamentHoverList } from "./TournamentHoverList";
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
  goldCount?: number;
  silverCount?: number;
  bronzeCount?: number;
  ftTournaments?: Tournament[];
  goldTournaments?: Tournament[];
  silverTournaments?: Tournament[];
  bronzeTournaments?: Tournament[];
  cardVariant?: "elevated" | "nested";
  twoRows?: boolean;
}

function FinalTableCard({
  ftCount,
  ftTournaments,
  cardVariant,
}: {
  ftCount: number;
  ftTournaments: Tournament[];
  cardVariant: "elevated" | "nested";
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {ftTournaments.length > 0 && (
        <TournamentHoverList
          title="Final Tables"
          tournaments={ftTournaments}
          visible={hovered}
          align="left"
        />
      )}
      <ActivityCard
        title="Final Tables"
        value={ftCount}
        variant={cardVariant}
      />
    </div>
  );
}

export const SummarizeCards = ({
  totalTournaments,
  totalProfit,
  totalWinnings,
  abi,
  totalBuyIn,
  itmPercentage,
  itmCount,
  ftCount = 0,
  avgDailyBuyIn,
  goldCount = 0,
  silverCount = 0,
  bronzeCount = 0,
  ftTournaments = [],
  goldTournaments = [],
  silverTournaments = [],
  bronzeTournaments = [],
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

  const brlRate = currencies?.data?.rates?.BRL;

  const brlValue = (usd: number) =>
    brlRate !== undefined ? convertUsdToBrl(brlRate * usd) : undefined;

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
            convertedValue={brlValue(totalBuyIn)}
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
            convertedValue={brlValue(totalProfit)}
            variant={cardVariant}
          />
          {lucroTotalCard}
        </div>
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <ActivityCard
              title="Média de Buy-ins/dia"
              value={Number((avgDailyBuyIn ?? 0).toFixed(2))}
              isCurrency
              convertedValue={brlValue(avgDailyBuyIn ?? 0)}
              variant={cardVariant}
            />
          </div>
          <FinalTableCard
            ftCount={ftCount}
            ftTournaments={ftTournaments}
            cardVariant={cardVariant}
          />
          <PodiumCard
            goldCount={goldCount}
            silverCount={silverCount}
            bronzeCount={bronzeCount}
            goldTournaments={goldTournaments}
            silverTournaments={silverTournaments}
            bronzeTournaments={bronzeTournaments}
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
