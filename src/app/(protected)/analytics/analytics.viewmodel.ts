"use client";

import { useMemo, useState } from "react";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useStats } from "@/services/hooks/useStats";
import { useCurrency } from "@/services/hooks/useCurrency";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";
import { getEurToUsdRate, toUsd } from "@/utils/currencyConvert";
import type { Tournament } from "@/services/hooks/types";
import type { Deposit, Withdrawal, Rake } from "@/services/api/types";
import type {
  AnalyticsViewProps,
  BankCurvePoint,
  HeatmapEntry,
  PeriodStats,
  StreakInfo,
} from "./analytics.types";

const MONTH_NAMES_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toNum(v: unknown): number {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function buildCurve(
  deposits: Deposit[],
  withdrawals: Withdrawal[],
  rakes: Rake[],
  tournaments: Tournament[],
  eurToUsdRate: number,
): BankCurvePoint[] {
  const events: { date: string; amount: number }[] = [
    ...deposits.map((d) => ({ date: d.date, amount: d.amount })),
    ...withdrawals.map((w) => ({ date: w.date, amount: -w.amount })),
    ...rakes.map((r) => ({ date: r.date, amount: -r.amount })),
    ...tournaments.map((t) => ({
      date: String(t.date),
      amount: getTournamentLucroUsd(t, eurToUsdRate),
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dayTotals = new Map<string, number>();
  for (const e of events) {
    const day = e.date.split("T")[0];
    dayTotals.set(day, (dayTotals.get(day) ?? 0) + e.amount);
  }

  const sortedDays = Array.from(dayTotals.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  let balance = 0;
  return sortedDays.map(([day, delta]) => {
    balance += delta;
    const parts = day.split("-");
    return { date: day, balance, label: `${parts[2]}/${parts[1]}` };
  });
}

function computePeriodStats(
  tournaments: Tournament[],
  month: number,
  year: number,
  eurToUsdRate: number,
): PeriodStats {
  const filtered = tournaments.filter((t) => {
    const d = new Date(String(t.date));
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const profit = filtered.reduce(
    (acc, t) => acc + getTournamentLucroUsd(t, eurToUsdRate),
    0,
  );
  const totalBuyIn = filtered.reduce(
    (acc, t) => acc + toUsd(toNum(t.buyIn), t.currency, eurToUsdRate),
    0,
  );
  return {
    profit,
    roi: totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0,
    abi: filtered.length > 0 ? totalBuyIn / filtered.length : 0,
    itmPct:
      filtered.length > 0
        ? (filtered.filter((t) => t.itm).length / filtered.length) * 100
        : 0,
    count: filtered.length,
  };
}

function buildHeatmap(
  tournaments: Tournament[],
  eurToUsdRate: number,
): HeatmapEntry[] {
  const map = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }));
  for (const t of tournaments) {
    const dow = new Date(String(t.date)).getDay();
    map[dow].total += getTournamentLucroUsd(t, eurToUsdRate);
    map[dow].count += 1;
  }
  return DOW_LABELS.map((day, i) => ({
    day,
    avg: map[i].count > 0 ? map[i].total / map[i].count : 0,
    count: map[i].count,
  }));
}

function computeStreaks(
  tournaments: Tournament[],
  eurToUsdRate: number,
): StreakInfo {
  const dayMap = new Map<string, number>();
  for (const t of tournaments) {
    const day = String(t.date).split("T")[0];
    dayMap.set(
      day,
      (dayMap.get(day) ?? 0) + getTournamentLucroUsd(t, eurToUsdRate),
    );
  }
  const days = Array.from(dayMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let curWin = 0;
  let curLoss = 0;

  for (const [, profit] of days) {
    if (profit > 0) {
      curWin++;
      curLoss = 0;
      if (curWin > maxWinStreak) maxWinStreak = curWin;
    } else {
      curLoss++;
      curWin = 0;
      if (curLoss > maxLossStreak) maxLossStreak = curLoss;
    }
  }

  let currentStreak = 0;
  let currentStreakType: "win" | "loss" | "neutral" = "neutral";
  if (days.length > 0) {
    const lastProfit = days[days.length - 1][1];
    if (lastProfit > 0) {
      currentStreakType = "win";
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i][1] > 0) currentStreak++;
        else break;
      }
    } else if (lastProfit < 0) {
      currentStreakType = "loss";
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i][1] < 0) currentStreak++;
        else break;
      }
    }
  }

  return { maxWinStreak, maxLossStreak, currentStreak, currentStreakType };
}

export function useAnalyticsViewModel(): AnalyticsViewProps {
  const { data: user, isLoading: userLoading } = useGetUser();
  const { getAllTournamentsForStats } = useStats();
  // isPending: true enquanto não há dados (evita flash com curva vazia no mount)
  const { data: tournamentsData, isPending: tournamentsLoading } =
    getAllTournamentsForStats;
  const { currencies } = useCurrency();

  const [thisMonthIdx] = useState(() => new Date().getMonth());
  const [thisYear] = useState(() => new Date().getFullYear());

  const lastMonthDate = new Date(thisYear, thisMonthIdx - 1, 1);
  const lastMonthIdx = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);
  const tournaments: Tournament[] = useMemo(
    () => tournamentsData?.data?.data ?? [],
    [tournamentsData],
  );

  const deposits = useMemo(() => user?.bank?.deposits ?? [], [user?.bank?.deposits]);
  const withdrawals = useMemo(() => user?.bank?.withdrawals ?? [], [user?.bank?.withdrawals]);
  const rakes = useMemo(() => user?.bank?.rakes ?? [], [user?.bank?.rakes]);

  const totalWinnings = useMemo(
    () =>
      tournaments.reduce(
        (acc, t) => acc + getTournamentLucroUsd(t, eurToUsdRate),
        0,
      ),
    [tournaments, eurToUsdRate],
  );

  const currentBalance = useMemo(() => {
    const backendBank = user?.bank?.bank ?? 0;
    const backendProfit = user?.bank?.profit ?? 0;
    return backendBank - backendProfit + totalWinnings;
  }, [user?.bank?.bank, user?.bank?.profit, totalWinnings]);

  const curve = useMemo(
    () => buildCurve(deposits, withdrawals, rakes, tournaments, eurToUsdRate),
    [deposits, withdrawals, rakes, tournaments, eurToUsdRate],
  );

  const thisMonth = useMemo(
    () =>
      computePeriodStats(tournaments, thisMonthIdx, thisYear, eurToUsdRate),
    [tournaments, thisMonthIdx, thisYear, eurToUsdRate],
  );

  const lastMonth = useMemo(
    () =>
      computePeriodStats(
        tournaments,
        lastMonthIdx,
        lastMonthYear,
        eurToUsdRate,
      ),
    [tournaments, lastMonthIdx, lastMonthYear, eurToUsdRate],
  );

  const heatmap = useMemo(
    () => buildHeatmap(tournaments, eurToUsdRate),
    [tournaments, eurToUsdRate],
  );

  const streaks = useMemo(
    () => computeStreaks(tournaments, eurToUsdRate),
    [tournaments, eurToUsdRate],
  );

  return {
    isLoading: userLoading || tournamentsLoading,
    hasCurveData: curve.length > 0,
    curve,
    currentBalance,
    thisMonth,
    lastMonth,
    thisMonthName: `${MONTH_NAMES_PT[thisMonthIdx]} ${thisYear}`,
    lastMonthName: `${MONTH_NAMES_PT[lastMonthIdx]} ${lastMonthYear}`,
    heatmap,
    streaks,
  };
}
