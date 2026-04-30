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

function buildPlatformData(tournaments: Tournament[]): {
  allPlatforms: StatsPlatformEntry[];
  platformStats: StatsPlatformStats | null;
} {
  if (!tournaments.length) return { allPlatforms: [], platformStats: null };

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

  const allPlatforms: StatsPlatformEntry[] = Array.from(map.entries())
    .map(([platform, data]) => ({ platform, ...data }))
    .sort((a, b) => b.profit - a.profit);

  const byCount = [...allPlatforms].sort((a, b) => b.count - a.count);

  return {
    allPlatforms,
    platformStats: {
      mostProfit: allPlatforms[0] ?? null,
      mostLoss: allPlatforms[allPlatforms.length - 1] ?? null,
      mostTournaments: byCount[0] ?? null,
      leastTournaments: byCount[byCount.length - 1] ?? null,
    },
  };
}

export function useStatsViewModel(): StatsViewProps {
  const { getStatsSummary, getAllTournamentsForStats } = useStats();
  const { data, isLoading, isError } = getStatsSummary;
  const { data: allTournamentsData } = getAllTournamentsForStats;

  const summary = data?.data as StatsSummary | undefined;
  const allTournaments: Tournament[] = useMemo(
    () => allTournamentsData?.data?.data ?? [],
    [allTournamentsData],
  );

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

  const { allPlatforms, platformStats } = useMemo(
    () => buildPlatformData(allTournaments),
    [allTournaments],
  );

  const totalTournaments = allTournaments.length;

  const itmRate = useMemo(
    () =>
      totalTournaments > 0
        ? (allTournaments.filter((t) => t.itm).length / totalTournaments) * 100
        : 0,
    [allTournaments, totalTournaments],
  );

  const ftRate = useMemo(
    () =>
      totalTournaments > 0
        ? (allTournaments.filter((t) => t.hasFt).length / totalTournaments) *
          100
        : 0,
    [allTournaments, totalTournaments],
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
    allPlatforms,
    totalTournaments,
    itmRate,
    ftRate,
  };
}
