"use client";

import { useMemo } from "react";
import { useStats } from "@/services/hooks/useStats";
import type {
  StatsBucketRange,
  StatsBucketRecords,
  StatsSummary,
} from "@/services/hooks/types";
import type { BucketCardData, StatsViewProps } from "./stats.types";

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

export function useStatsViewModel(): StatsViewProps {
  const { getStatsSummary } = useStats();
  const { data, isLoading, isError } = getStatsSummary;

  const summary = data?.data as StatsSummary | undefined;

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

  return {
    isLoading,
    isError,
    hasData: Boolean(summary),
    biggestBuyIn: summary?.biggestBuyIn ?? null,
    mostTournamentsInADay: summary?.mostTournamentsInADay ?? null,
    highestAbiDay: summary?.highestAbiDay ?? null,
    profitBuckets,
    lossBuckets,
  };
}
