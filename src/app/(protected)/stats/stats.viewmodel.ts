"use client";

import { useMemo } from "react";
import { useStats } from "@/services/hooks/useStats";
import type {
  StatsBucketRange,
  StatsBucketRecords,
  StatsSummary,
  Tournament,
} from "@/services/hooks/types";
import type {
  BucketCardData,
  StatsPlatformEntry,
  StatsPlatformStats,
  StatsViewProps,
} from "./stats.types";

const RANGE_LABELS: Record<StatsBucketRange, string> = {
  day: "Dia",
  week: "Semana",
  month: "Mês",
  year: "Ano",
};

const RANGE_ORDER: StatsBucketRange[] = ["day", "week", "month", "year"];

function toBucketCards(records: StatsBucketRecords): BucketCardData[] {
  return RANGE_ORDER.map((range) => ({
    range,
    label: RANGE_LABELS[range],
    record: records[range] ?? null,
  }));
}

function computePlatformStats(tournaments: Tournament[]): StatsPlatformStats | null {
  if (!tournaments.length) return null;

  const map = new Map<string, { profit: number; count: number }>();

  for (const t of tournaments) {
    const profit =
      t.profit !== undefined
        ? t.profit
        : Number(t.result) - Number(t.buyIn);
    const existing = map.get(t.platform);
    if (existing) {
      existing.profit += profit;
      existing.count += 1;
    } else {
      map.set(t.platform, { profit, count: 1 });
    }
  }

  const entries: StatsPlatformEntry[] = Array.from(map.entries()).map(
    ([platform, data]) => ({ platform, ...data }),
  );

  const sortedByProfit = [...entries].sort((a, b) => b.profit - a.profit);
  const sortedByCount = [...entries].sort((a, b) => b.count - a.count);

  return {
    mostProfit: sortedByProfit[0] ?? null,
    mostLoss: sortedByProfit[sortedByProfit.length - 1] ?? null,
    mostTournaments: sortedByCount[0] ?? null,
    leastTournaments: sortedByCount[sortedByCount.length - 1] ?? null,
  };
}

export function useStatsViewModel(): StatsViewProps {
  const { getStatsSummary, getAllTournamentsForStats } = useStats();
  const { data, isLoading, isError } = getStatsSummary;
  const { data: allTournamentsData } = getAllTournamentsForStats;

  const summary = data?.data as StatsSummary | undefined;
  const allTournaments: Tournament[] = allTournamentsData?.data?.data ?? [];

  const profitBuckets = useMemo<BucketCardData[]>(
    () =>
      summary
        ? toBucketCards(summary.profitRecords)
        : RANGE_ORDER.map((range) => ({
            range,
            label: RANGE_LABELS[range],
            record: null,
          })),
    [summary],
  );

  const lossBuckets = useMemo<BucketCardData[]>(
    () =>
      summary
        ? toBucketCards(summary.lossRecords)
        : RANGE_ORDER.map((range) => ({
            range,
            label: RANGE_LABELS[range],
            record: null,
          })),
    [summary],
  );

  const platformStats = useMemo(
    () => computePlatformStats(allTournaments),
    [allTournaments],
  );

  return {
    isLoading,
    isError,
    hasData: Boolean(summary),
    biggestBuyIn: summary?.biggestBuyIn ?? null,
    mostTournamentsInADay: summary?.mostTournamentsInADay ?? null,
    highestAbiDay: summary?.highestAbiDay ?? null,
    profitBuckets,
    lossBuckets,
    platformStats,
  };
}
