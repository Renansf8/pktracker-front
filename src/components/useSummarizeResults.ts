"use client";

import { useMemo, useState } from "react";
import { useTournaments } from "@/services/hooks/useTournaments";
import { useCurrency } from "@/services/hooks/useCurrency";
import {
  convertIsoDateToBr,
  isSameCalendarDayLocal,
  parseTournamentDateLocal,
} from "@/utils/dateConvert";
import { getEurToUsdRate, toUsd } from "@/utils/currencyConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";
import type { Tournament } from "@/services/hooks/types";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const toNum = (v: unknown): number => {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const calcItm = (list: Tournament[]) => {
  const count = list.filter((t) => t.itm === true).length;
  return { itmCount: count, itmPercentage: list.length > 0 ? (count / list.length) * 100 : 0 };
};

const calcFt = (list: Tournament[]) => list.filter((t) => t.hasFt === true).length;

const calcAvgDailyBuyIn = (list: Tournament[], rate: number) => {
  if (!list.length) return 0;
  const distinctDays = new Set(list.map((t) => String(t.date).split("T")[0])).size;
  const total = list.reduce((acc, t) => acc + toUsd(toNum(t.buyIn), t.currency, rate), 0);
  return distinctDays > 0 ? total / distinctDays : 0;
};

function buildPeriodStats(list: Tournament[], rate: number) {
  const totalBuyIn = list.reduce((acc, t) => acc + toUsd(toNum(t.buyIn), t.currency, rate), 0);
  const totalProfit = list.reduce((acc, t) => acc + toUsd(toNum(t.result), t.currency, rate), 0);
  const totalWinnings = list.reduce((acc, t) => acc + getTournamentLucroUsd(t, rate), 0);
  const { itmCount, itmPercentage } = calcItm(list);
  return {
    totalTournaments: list.length,
    totalBuyIn,
    abi: list.length > 0 ? totalBuyIn / list.length : 0,
    totalProfit,
    totalWinnings,
    itmCount,
    itmPercentage,
    ftCount: calcFt(list),
    avgDailyBuyIn: calcAvgDailyBuyIn(list, rate),
    goldCount: list.filter((t) => t.position === 1).length,
    silverCount: list.filter((t) => t.position === 2).length,
    bronzeCount: list.filter((t) => t.position === 3).length,
  };
}

export function useSummarizeResults() {
  const { getAllTournaments } = useTournaments("", 1, 9999);
  const { currencies } = useCurrency();
  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);
  const [periodTab, setPeriodTab] = useState("dia");

  const { data: tournaments } = getAllTournaments;
  const allTournaments = tournaments?.data?.data;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const todayBr = `${String(today.getDate()).padStart(2, "0")}/${String(currentMonth + 1).padStart(2, "0")}/${currentYear}`;
  const currentMonthName = MONTH_NAMES[currentMonth]!;
  const currentMonthFormat = `${String(currentMonth + 1).padStart(2, "0")}/${currentYear}`;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekStartTime = weekStart.getTime();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekRangeLabel = [weekStart, weekEnd]
    .map((d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`)
    .join(" – ");

  const todayTournaments = useMemo(() => {
    if (!allTournaments?.length) return [];
    const ref = new Date();
    return allTournaments.filter((t: Tournament) => {
      const datePart = convertIsoDateToBr(String(t.date)).split(" ")[0];
      return isSameCalendarDayLocal(t.date, ref) || datePart === todayBr;
    });
  }, [allTournaments, todayBr]);

  const monthTournaments = useMemo(() => {
    if (!allTournaments?.length) return [];
    return allTournaments.filter((t: Tournament) => {
      const [, month, year] = convertIsoDateToBr(t.date).split(" ")[0]!.split("/");
      return `${month}/${year}` === currentMonthFormat;
    });
  }, [allTournaments, currentMonthFormat]);

  const weekTournaments = useMemo(() => {
    if (!allTournaments?.length) return [];
    const wStart = new Date(weekStartTime);
    wStart.setHours(0, 0, 0, 0);
    const wEnd = new Date(weekStartTime);
    wEnd.setDate(wStart.getDate() + 6);
    wEnd.setHours(23, 59, 59, 999);
    return allTournaments.filter((t: Tournament) => {
      const d = parseTournamentDateLocal(t.date);
      return d >= wStart && d <= wEnd;
    });
  }, [allTournaments, weekStartTime]);

  const yearTournaments = useMemo(() => {
    if (!allTournaments?.length) return [];
    return allTournaments.filter(
      (t: Tournament) => parseTournamentDateLocal(t.date).getFullYear() === currentYear,
    );
  }, [allTournaments, currentYear]);

  const dayStats = useMemo(
    () => buildPeriodStats(todayTournaments, eurToUsdRate),
    [todayTournaments, eurToUsdRate],
  );
  const weekStats = useMemo(
    () => buildPeriodStats(weekTournaments, eurToUsdRate),
    [weekTournaments, eurToUsdRate],
  );
  const monthStats = useMemo(
    () => buildPeriodStats(monthTournaments, eurToUsdRate),
    [monthTournaments, eurToUsdRate],
  );
  const yearStats = useMemo(
    () => buildPeriodStats(yearTournaments, eurToUsdRate),
    [yearTournaments, eurToUsdRate],
  );

  const dayProfitChartData = useMemo(() => {
    if (!todayTournaments.length) return [];
    const namesSeen = new Map<string, number>();
    return [...todayTournaments]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((t) => {
        const occ = (namesSeen.get(t.name) ?? 0) + 1;
        namesSeen.set(t.name, occ);
        let label = t.name.length > 26 ? `${t.name.slice(0, 26)}…` : t.name;
        if (occ > 1) label = `${label} (${occ})`;
        return { torneio: label, Lucro: getTournamentLucroUsd(t, eurToUsdRate) };
      });
  }, [todayTournaments, eurToUsdRate]);

  const weekProfitChartData = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const t of weekTournaments) {
      const d = parseTournamentDateLocal(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      byDate.set(key, (byDate.get(key) ?? 0) + getTournamentLucroUsd(t, eurToUsdRate));
    }
    const wStart = new Date(weekStartTime);
    wStart.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(wStart);
      dayDate.setDate(wStart.getDate() + i);
      const key = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`;
      return {
        dia: `${DAY_NAMES[dayDate.getDay()]} ${String(dayDate.getDate()).padStart(2, "0")}/${String(dayDate.getMonth() + 1).padStart(2, "0")}`,
        Lucro: byDate.get(key) ?? 0,
      };
    });
  }, [weekTournaments, weekStartTime, eurToUsdRate]);

  const yearProfitChartData = useMemo(() => {
    const byMonth = new Map<number, number>();
    for (const t of yearTournaments) {
      const d = parseTournamentDateLocal(t.date);
      byMonth.set(d.getMonth(), (byMonth.get(d.getMonth()) ?? 0) + getTournamentLucroUsd(t, eurToUsdRate));
    }
    return MONTH_NAMES.map((name, idx) => ({
      mes: name.slice(0, 3),
      Lucro: byMonth.get(idx) ?? 0,
    }));
  }, [yearTournaments, eurToUsdRate]);

  const monthProfitChartData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const byDayFull = new Map<string, number>();
    for (const t of monthTournaments) {
      const datePart = convertIsoDateToBr(t.date).split(" ")[0]!;
      byDayFull.set(datePart, (byDayFull.get(datePart) ?? 0) + getTournamentLucroUsd(t, eurToUsdRate));
    }
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dd = String(i + 1).padStart(2, "0");
      const mm = String(currentMonth + 1).padStart(2, "0");
      return { dia: `${dd}/${mm}`, Lucro: byDayFull.get(`${dd}/${mm}/${currentYear}`) ?? 0 };
    });
  }, [monthTournaments, eurToUsdRate, currentYear, currentMonth]);

  return {
    periodTab,
    setPeriodTab,
    todayBr,
    weekRangeLabel,
    currentMonthName,
    currentYear,
    dayStats,
    weekStats,
    monthStats,
    yearStats,
    dayProfitChartData,
    weekProfitChartData,
    monthProfitChartData,
    yearProfitChartData,
  };
}
