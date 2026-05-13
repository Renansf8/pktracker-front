"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarizeCards } from "./Summarize Cards";
import {
  DayProfitBarChart,
  MonthProfitBarChart,
  WeekProfitBarChart,
  YearProfitBarChart,
} from "@/components/ResultsProfitCharts";
import { useSummarizeResults } from "./useSummarizeResults";

const periodTabsListClass =
  "h-auto w-full max-w-xl flex-wrap gap-1 rounded-xl p-1.5 sm:w-[50%]";

const periodTabTriggerClass = "min-w-[4.25rem] flex-1 px-3 py-2.5";

export const SummarizeResults = () => {
  const {
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
  } = useSummarizeResults();

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
          <SummarizeCards {...dayStats} cardVariant="nested" twoRows />
          <DayProfitBarChart data={dayProfitChartData} />
        </TabsContent>
        <TabsContent value="semana" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-lg">{weekRangeLabel}</p>
          <SummarizeCards {...weekStats} cardVariant="nested" twoRows />
          <WeekProfitBarChart key={`week-chart-${periodTab}`} data={weekProfitChartData} />
        </TabsContent>
        <TabsContent value="mes" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-xl">{currentMonthName}</p>
          <SummarizeCards {...monthStats} cardVariant="nested" twoRows />
          <MonthProfitBarChart key={`month-chart-${periodTab}`} data={monthProfitChartData} />
        </TabsContent>
        <TabsContent value="ano" className="mt-2 w-full space-y-4">
          <p className="text-text-primary text-xl">{currentYear}</p>
          <SummarizeCards {...yearStats} cardVariant="nested" twoRows />
          <YearProfitBarChart key={`year-chart-${periodTab}`} data={yearProfitChartData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
