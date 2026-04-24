"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeCards } from "./Summarize Cards";
import {
  DayProfitBarChart,
  MonthProfitBarChart,
  WeekProfitBarChart,
  YearProfitBarChart,
} from "@/components/ResultsProfitCharts";
import type { Tournament } from "@/services/hooks/types";
import { useTournaments } from "@/services/hooks/useTournaments";
import {
  convertIsoDateToBr,
  isSameCalendarDayLocal,
  parseTournamentDateLocal,
} from "@/utils/dateConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";

/** Layout for período (Dia / Semana / …); cores vêm do `tabs` base alinhado ao glass */
const periodTabsListClass =
  "h-auto w-full max-w-xl flex-wrap gap-1 rounded-xl p-1.5 sm:w-[50%]";

const periodTabTriggerClass = "min-w-[4.25rem] flex-1 px-3 py-2.5";

const calcItm = (list: Tournament[]) => {
  const count = list.filter((t) => t.itm === true).length;
  const pct = list.length > 0 ? (count / list.length) * 100 : 0;
  return { itmCount: count, itmPercentage: pct };
};

const calcFt = (list: Tournament[]) =>
  list.filter((t) => t.hasFt === true).length;

const calcAvgDailyBuyIn = (list: Tournament[]) => {
  if (!list.length) return 0;
  const distinctDays = new Set(list.map((t) => String(t.date).split("T")[0])).size;
  const totalBuyIn = list.reduce((acc, t) => acc + Number(t.buyIn), 0);
  return distinctDays > 0 ? totalBuyIn / distinctDays : 0;
};

export const SummarizeResults = () => {
  /** Limite alto: a visão "Dia" precisa dos torneios de hoje; página 1 com 20 pode não incluí-los. */
  const { getAllTournaments } = useTournaments("", 1, 500);
  const [periodTab, setPeriodTab] = useState("dia");

  const { data: tournaments } = getAllTournaments;

  const today = new Date();
  const todayBr = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  // Get month name in Portuguese
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const currentMonthName = monthNames[today.getMonth()];

  const todayTournaments = useMemo(() => {
    const list = tournaments?.data?.data;
    if (!list?.length) {
      return [];
    }
    const ref = new Date();
    return list.filter((tournament: Tournament) => {
      const byCalendar = isSameCalendarDayLocal(tournament.date, ref);
      const datePart = convertIsoDateToBr(String(tournament.date)).split(
        " ",
      )[0];
      const byLegacyString = datePart === todayBr;
      return byCalendar || byLegacyString;
    });
  }, [tournaments?.data?.data, todayBr]);

  // Format for comparison (MM/YYYY)
  const currentMonthFormat = `${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  const monthTournaments = tournaments?.data?.data?.filter(
    (tournament: Tournament) => {
      const tournamentDate = convertIsoDateToBr(tournament.date).split(" ")[0]; // Get only the date part
      const [, month, year] = tournamentDate.split("/");
      return `${month}/${year}` === currentMonthFormat;
    },
  );

  // Week boundaries (domingo a sábado)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const formatDateShort = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

  const weekRangeLabel = `${formatDateShort(weekStart)} – ${formatDateShort(weekEnd)}`;

  const weekStartTime = weekStart.getTime();

  const weekTournaments = useMemo(() => {
    const list = tournaments?.data?.data;
    if (!list?.length) return [];
    const wStart = new Date(weekStartTime);
    wStart.setHours(0, 0, 0, 0);
    const wEnd = new Date(weekStartTime);
    wEnd.setDate(wStart.getDate() + 6);
    wEnd.setHours(23, 59, 59, 999);
    return list.filter((tournament: Tournament) => {
      const d = parseTournamentDateLocal(tournament.date);
      return d >= wStart && d <= wEnd;
    });
  }, [tournaments?.data?.data, weekStartTime]);

  // Year filter
  const currentYear = today.getFullYear();

  const yearTournaments = useMemo(() => {
    const list = tournaments?.data?.data;
    if (!list?.length) return [];
    return list.filter((tournament: Tournament) => {
      const d = parseTournamentDateLocal(tournament.date);
      return d.getFullYear() === currentYear;
    });
  }, [tournaments?.data?.data, currentYear]);

  // Daily stats
  const totalTournaments = todayTournaments?.length || 0;
  const totalBuyIn = todayTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.buyIn), 0) || 0;
  const abi = totalTournaments > 0 ? totalBuyIn / totalTournaments : 0;
  const totalProfit = todayTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.result), 0) || 0;
  const totalWinnings = todayTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.profit), 0) || 0;
  const { itmCount, itmPercentage } = calcItm(todayTournaments);
  const ftCount = calcFt(todayTournaments);
  const avgDailyBuyIn = calcAvgDailyBuyIn(todayTournaments);

  // Monthly stats
  const monthlyTotalTournaments = monthTournaments?.length || 0;
  const monthlyTotalBuyIn = monthTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.buyIn), 0) || 0;
  const monthlyAbi = monthlyTotalTournaments > 0 ? monthlyTotalBuyIn / monthlyTotalTournaments : 0;
  const monthlyTotalProfit = monthTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.result), 0) || 0;
  const monthlyTotalWinnings = monthTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.profit), 0) || 0;
  const { itmCount: monthlyItmCount, itmPercentage: monthlyItmPercentage } = calcItm(monthTournaments ?? []);
  const monthlyFtCount = calcFt(monthTournaments ?? []);
  const monthlyAvgDailyBuyIn = calcAvgDailyBuyIn(monthTournaments ?? []);

  // Weekly stats
  const weeklyTotalTournaments = weekTournaments?.length || 0;
  const weeklyTotalBuyIn = weekTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.buyIn), 0) || 0;
  const weeklyAbi = weeklyTotalTournaments > 0 ? weeklyTotalBuyIn / weeklyTotalTournaments : 0;
  const weeklyTotalProfit = weekTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.result), 0) || 0;
  const weeklyTotalWinnings = weekTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.profit), 0) || 0;
  const { itmCount: weeklyItmCount, itmPercentage: weeklyItmPercentage } = calcItm(weekTournaments);
  const weeklyFtCount = calcFt(weekTournaments);
  const weeklyAvgDailyBuyIn = calcAvgDailyBuyIn(weekTournaments);

  // Yearly stats
  const yearlyTotalTournaments = yearTournaments?.length || 0;
  const yearlyTotalBuyIn = yearTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.buyIn), 0) || 0;
  const yearlyAbi = yearlyTotalTournaments > 0 ? yearlyTotalBuyIn / yearlyTotalTournaments : 0;
  const yearlyTotalProfit = yearTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.result), 0) || 0;
  const yearlyTotalWinnings = yearTournaments?.reduce((acc: number, t: Tournament) => acc + Number(t.profit), 0) || 0;
  const { itmCount: yearlyItmCount, itmPercentage: yearlyItmPercentage } = calcItm(yearTournaments);
  const yearlyFtCount = calcFt(yearTournaments);
  const yearlyAvgDailyBuyIn = calcAvgDailyBuyIn(yearTournaments);

  const dayProfitChartData = useMemo(() => {
    if (!todayTournaments?.length) return [];
    const sorted = [...todayTournaments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const namesSeen = new Map<string, number>();
    return sorted.map((t) => {
      const occ = (namesSeen.get(t.name) ?? 0) + 1;
      namesSeen.set(t.name, occ);
      let label = t.name.length > 26 ? `${t.name.slice(0, 26)}…` : t.name;
      if (occ > 1) {
        label = `${label} (${occ})`;
      }
      return {
        torneio: label,
        Lucro: getTournamentLucroUsd(t),
      };
    });
  }, [todayTournaments]);

  const weekProfitChartData = useMemo(() => {
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const byDate = new Map<string, number>();

    if (weekTournaments?.length) {
      for (const t of weekTournaments) {
        const d = parseTournamentDateLocal(t.date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const p = getTournamentLucroUsd(t);
        byDate.set(key, (byDate.get(key) || 0) + p);
      }
    }

    const rows: { dia: string; Lucro: number }[] = [];
    const wStart = new Date(weekStartTime);
    wStart.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(wStart);
      dayDate.setDate(wStart.getDate() + i);
      const key = `${dayDate.getFullYear()}-${dayDate.getMonth()}-${dayDate.getDate()}`;
      const dd = String(dayDate.getDate()).padStart(2, "0");
      const mm = String(dayDate.getMonth() + 1).padStart(2, "0");
      rows.push({
        dia: `${dayNames[dayDate.getDay()]} ${dd}/${mm}`,
        Lucro: byDate.get(key) ?? 0,
      });
    }
    return rows;
  }, [weekTournaments, weekStartTime]);

  const yearProfitChartData = useMemo(() => {
    const byMonth = new Map<number, number>();

    if (yearTournaments?.length) {
      for (const t of yearTournaments) {
        const d = parseTournamentDateLocal(t.date);
        const m = d.getMonth();
        const p = getTournamentLucroUsd(t);
        byMonth.set(m, (byMonth.get(m) || 0) + p);
      }
    }

    return monthNames.map((name, idx) => ({
      mes: name.slice(0, 3),
      Lucro: byMonth.get(idx) ?? 0,
    }));
  }, [yearTournaments]);

  const monthProfitChartData = useMemo(() => {
    const ref = new Date();
    const y = ref.getFullYear();
    const m = ref.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const byDayFull = new Map<string, number>();
    if (monthTournaments?.length) {
      for (const t of monthTournaments) {
        const datePart = convertIsoDateToBr(t.date).split(" ")[0];
        const p = getTournamentLucroUsd(t);
        byDayFull.set(datePart, (byDayFull.get(datePart) || 0) + p);
      }
    }

    const rows: { dia: string; Lucro: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = String(d).padStart(2, "0");
      const mm = String(m + 1).padStart(2, "0");
      const fullKey = `${dd}/${mm}/${y}`;
      rows.push({
        dia: `${dd}/${mm}`,
        Lucro: byDayFull.get(fullKey) ?? 0,
      });
    }
    return rows;
  }, [monthTournaments]);

  return (
    <div className="glass-panel mt-8 flex flex-col gap-6 rounded-3xl p-6 sm:p-8">
      <p className="text-text-primary text-2xl font-semibold tracking-tight">
        Resultados
      </p>

      <Tabs value={periodTab} onValueChange={setPeriodTab}>
        <TabsList className={periodTabsListClass}>
          <TabsTrigger className={periodTabTriggerClass} value="dia">
            Dia
          </TabsTrigger>
          <TabsTrigger className={periodTabTriggerClass} value="semana">
            Semana
          </TabsTrigger>
          <TabsTrigger className={periodTabTriggerClass} value="mes">
            Mês
          </TabsTrigger>
          <TabsTrigger className={periodTabTriggerClass} value="ano">
            Ano
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dia" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-lg">{todayBr}</p>
          <SummarizeCards
            totalTournaments={totalTournaments}
            totalProfit={totalProfit}
            totalWinnings={totalWinnings}
            abi={abi}
            totalBuyIn={totalBuyIn}
            itmPercentage={itmPercentage}
            itmCount={itmCount}
            ftCount={ftCount}
            avgDailyBuyIn={avgDailyBuyIn}
            cardVariant="nested"
            twoRows
          />
          <DayProfitBarChart data={dayProfitChartData} />
        </TabsContent>
        <TabsContent value="semana" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-lg">{weekRangeLabel}</p>
          <SummarizeCards
            totalTournaments={weeklyTotalTournaments}
            totalProfit={weeklyTotalProfit}
            totalWinnings={weeklyTotalWinnings}
            abi={weeklyAbi}
            totalBuyIn={weeklyTotalBuyIn}
            itmPercentage={weeklyItmPercentage}
            itmCount={weeklyItmCount}
            ftCount={weeklyFtCount}
            avgDailyBuyIn={weeklyAvgDailyBuyIn}
            cardVariant="nested"
            twoRows
          />
          <WeekProfitBarChart
            key={`week-chart-${periodTab}`}
            data={weekProfitChartData}
          />
        </TabsContent>
        <TabsContent value="mes" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-xl">{currentMonthName}</p>
          <SummarizeCards
            totalTournaments={monthlyTotalTournaments}
            totalProfit={monthlyTotalProfit}
            totalWinnings={monthlyTotalWinnings}
            abi={monthlyAbi}
            totalBuyIn={monthlyTotalBuyIn}
            itmPercentage={monthlyItmPercentage}
            itmCount={monthlyItmCount}
            ftCount={monthlyFtCount}
            avgDailyBuyIn={monthlyAvgDailyBuyIn}
            cardVariant="nested"
            twoRows
          />
          <MonthProfitBarChart
            key={`month-chart-${periodTab}`}
            data={monthProfitChartData}
          />
        </TabsContent>
        <TabsContent value="ano" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-xl">{currentYear}</p>
          <SummarizeCards
            totalTournaments={yearlyTotalTournaments}
            totalProfit={yearlyTotalProfit}
            totalWinnings={yearlyTotalWinnings}
            abi={yearlyAbi}
            totalBuyIn={yearlyTotalBuyIn}
            itmPercentage={yearlyItmPercentage}
            itmCount={yearlyItmCount}
            ftCount={yearlyFtCount}
            avgDailyBuyIn={yearlyAvgDailyBuyIn}
            cardVariant="nested"
            twoRows
          />
          <YearProfitBarChart
            key={`year-chart-${periodTab}`}
            data={yearProfitChartData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
