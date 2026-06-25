"use client";

import { useMemo, useState } from "react";
import { useTournaments } from "@/services/hooks/useTournaments";
import { useCurrency } from "@/services/hooks/useCurrency";
import { getEurToUsdRate, toUsd } from "@/utils/currencyConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";
import type { Tournament } from "@/services/hooks/types";
import type { MonthlyStats, MonthlyViewProps, MonthlyYearTotals } from "./monthly.types";

function toNum(v: unknown): number {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useMonthlyViewModel(): MonthlyViewProps {
  const { getAllTournaments } = useTournaments("", 1, 9999);
  const { data: tournamentsResponse, isLoading } = getAllTournaments;
  const { currencies } = useCurrency();
  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);
  const brlRate: number | undefined = currencies?.data?.rates?.BRL;

  const tournaments: Tournament[] = useMemo(
    () => tournamentsResponse?.data?.data ?? [],
    [tournamentsResponse],
  );

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const t of tournaments) {
      const d = new Date(t.date);
      if (!Number.isNaN(d.getTime())) years.add(d.getFullYear());
    }
    const sorted = [...years].sort((a, b) => b - a);
    if (!sorted.length) sorted.push(new Date().getFullYear());
    return sorted;
  }, [tournaments]);

  const [selectedYear, setSelectedYear] = useState<number>(
    () => new Date().getFullYear(),
  );

  const months = useMemo<MonthlyStats[]>(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const filtered = tournaments.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === selectedYear && d.getMonth() === month;
      });

      const profit = filtered.reduce(
        (acc, t) => acc + getTournamentLucroUsd(t, eurToUsdRate),
        0,
      );
      const totalBuyIn = filtered.reduce(
        (acc, t) => acc + toUsd(toNum(t.buyIn), t.currency, eurToUsdRate),
        0,
      );
      const count = filtered.length;
      const itmCount = filtered.filter((t) => t.itm).length;
      const ftCount = filtered.filter((t) => t.hasFt).length;
      const goldCount = filtered.filter((t) => t.position === 1).length;
      const silverCount = filtered.filter((t) => t.position === 2).length;
      const bronzeCount = filtered.filter((t) => t.position === 3).length;
      const days = new Set(
        filtered.map((t) => String(t.date).split("T")[0]),
      ).size;

      return {
        year: selectedYear,
        month,
        profit,
        totalBuyIn,
        count,
        itmCount,
        itmRate: count > 0 ? (itmCount / count) * 100 : 0,
        ftCount,
        goldCount,
        silverCount,
        bronzeCount,
        abi: count > 0 ? totalBuyIn / count : 0,
        days,
      };
    });
  }, [tournaments, selectedYear, eurToUsdRate]);

  const yearTotals = useMemo<MonthlyYearTotals>(() => {
    const profit = months.reduce((acc, m) => acc + m.profit, 0);
    const count = months.reduce((acc, m) => acc + m.count, 0);
    const totalBuyIn = months.reduce((acc, m) => acc + m.totalBuyIn, 0);
    const itmCount = months.reduce((acc, m) => acc + m.itmCount, 0);
    const days = months.reduce((acc, m) => acc + m.days, 0);
    return {
      profit,
      count,
      totalBuyIn,
      itmRate: count > 0 ? (itmCount / count) * 100 : 0,
      abi: count > 0 ? totalBuyIn / count : 0,
      days,
    };
  }, [months]);

  return {
    isLoading,
    selectedYear,
    availableYears,
    months,
    yearTotals,
    brlRate,
    onYearChange: setSelectedYear,
  };
}
