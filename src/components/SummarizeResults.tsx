import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeCards } from "./Summarize Cards";
import {
  DayProfitBarChart,
  MonthProfitBarChart,
} from "@/components/ResultsProfitCharts";
import type { Tournament } from "@/services/hooks/types";
import { useTournaments } from "@/services/hooks/useTournaments";
import {
  convertIsoDateToBr,
  isSameCalendarDayLocal,
} from "@/utils/dateConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";

/** Layout for período (Dia / Semana / …); cores vêm do `tabs` base alinhado ao glass */
const periodTabsListClass =
  "h-auto w-full max-w-xl flex-wrap gap-1 rounded-xl p-1.5 sm:w-[50%]";

const periodTabTriggerClass = "min-w-[4.25rem] flex-1 px-3 py-2.5";

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

  // Daily stats
  const totalTournaments = todayTournaments?.length || 0;

  const totalBuyIn =
    todayTournaments?.reduce((acc: number, tournament: Tournament) => {
      return acc + Number(tournament.buyIn);
    }, 0) || 0;

  const abi = totalTournaments > 0 ? totalBuyIn / totalTournaments : 0;

  const totalProfit =
    todayTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.result);
      return total;
    }, 0) || 0;

  const totalWinnings =
    todayTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.profit);
      return total;
    }, 0) || 0;

  // Monthly stats
  const monthlyTotalTournaments = monthTournaments?.length || 0;

  const monthlyTotalBuyIn =
    monthTournaments?.reduce((acc: number, tournament: Tournament) => {
      return acc + Number(tournament.buyIn);
    }, 0) || 0;

  const monthlyAbi =
    monthlyTotalTournaments > 0
      ? monthlyTotalBuyIn / monthlyTotalTournaments
      : 0;

  const monthlyTotalProfit =
    monthTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.result);
      return total;
    }, 0) || 0;

  const monthlyTotalWinnings =
    monthTournaments?.reduce((acc: number, tournament: Tournament) => {
      const total = acc + Number(tournament.profit);
      return total;
    }, 0) || 0;

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
            cardVariant="nested"
          />
          <DayProfitBarChart data={dayProfitChartData} />
        </TabsContent>
        <TabsContent value="semana">
          <p className="mt-2 text-sm text-zinc-500">
            Visão semanal em breve.
          </p>
        </TabsContent>
        <TabsContent value="mes" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-xl">{currentMonthName}</p>
          <SummarizeCards
            totalTournaments={monthlyTotalTournaments}
            totalProfit={monthlyTotalProfit}
            totalWinnings={monthlyTotalWinnings}
            abi={monthlyAbi}
            totalBuyIn={monthlyTotalBuyIn}
            cardVariant="nested"
          />
          <MonthProfitBarChart
            key={`month-chart-${periodTab}`}
            data={monthProfitChartData}
          />
        </TabsContent>
        <TabsContent value="ano">
          <p className="mt-2 text-sm text-zinc-500">Visão anual em breve.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
