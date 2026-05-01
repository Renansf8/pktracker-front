"use client";

import { useMemo } from "react";
import { useStats } from "@/services/hooks/useStats";
import { getTournamentProfitNative } from "@/utils/tournamentLucro";
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

function getWeekStartIso(d: Date): string {
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = utc.getUTCDay();
  utc.setUTCDate(utc.getUTCDate() + (day === 0 ? -6 : 1 - day));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function computeBucketRecords(
  tournaments: Tournament[],
  type: "profit" | "loss",
): StatsBucketRecords {
  const maps: Record<StatsBucketRange, Map<string, number>> = {
    day: new Map(),
    week: new Map(),
    month: new Map(),
    year: new Map(),
  };

  for (const t of tournaments) {
    const profit = getTournamentProfitNative(t);
    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) continue;

    const y = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");

    const keys: Record<StatsBucketRange, string> = {
      day: `${y}-${mo}-${dd}`,
      week: getWeekStartIso(d),
      month: `${y}-${mo}-01`,
      year: `${y}-01-01`,
    };

    for (const range of RANGE_ORDER) {
      const k = keys[range];
      maps[range].set(k, (maps[range].get(k) ?? 0) + profit);
    }
  }

  const result: StatsBucketRecords = { day: null, week: null, month: null, year: null };

  for (const range of RANGE_ORDER) {
    const map = maps[range];
    if (!map.size) continue;

    let bestKey = "";
    let bestAmount = type === "profit" ? -Infinity : Infinity;

    for (const [key, amount] of map) {
      if (type === "profit" ? amount > bestAmount : amount < bestAmount) {
        bestAmount = amount;
        bestKey = key;
      }
    }

    if (bestKey) result[range] = { bucketStart: bestKey, amount: bestAmount };
  }

  return result;
}

function buildPlatformData(tournaments: Tournament[]): {
  allPlatforms: StatsPlatformEntry[];
  platformStats: StatsPlatformStats | null;
} {
  if (!tournaments.length) return { allPlatforms: [], platformStats: null };

  const map = new Map<string, { profit: number; count: number }>();

  for (const t of tournaments) {
    const profit = getTournamentProfitNative(t);
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
    () => toBucketCards(computeBucketRecords(allTournaments, "profit")),
    [allTournaments],
  );

  const lossBuckets = useMemo<BucketCardData[]>(
    () => toBucketCards(computeBucketRecords(allTournaments, "loss")),
    [allTournaments],
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
