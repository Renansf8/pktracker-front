"use client";

import { Text, Title } from "@tremor/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const usd = (v: number) => `$ ${v.toFixed(2)}`;

const FILL_PROFIT_POS = "#22c55e";
const FILL_PROFIT_NEG = "#ef4444";
const STROKE_TOTAL_LINE = "#38bdf8";

const tickStyle = { fill: "var(--color-muted-foreground)", fontSize: 12 };
const tickStyleSmall = { fill: "var(--color-muted-foreground)", fontSize: 11 };

const yAxisMoneyWidth = 92;

function splitLucro(lucro: number) {
  const v = Number(lucro) || 0;
  return {
    LucroPos: v > 0 ? v : 0,
    LucroNeg: v < 0 ? v : 0,
  };
}

type RechartsTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number; name?: string }>;
  label?: string | number;
};

function ProfitTooltipContent({
  active,
  payload,
  label,
}: RechartsTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }
  const total = payload.reduce((sum, p) => sum + Number(p.value ?? 0), 0);
  return (
    <div className="rounded-lg border border-white/15 bg-slate-950/95 px-3 py-2 text-sm shadow-lg backdrop-blur-sm">
      <p className="text-xs text-slate-400">{String(label ?? "")}</p>
      <p
        className={cn(
          "font-medium",
          total > 0 && "text-green-500",
          total < 0 && "text-red-500",
          total === 0 && "text-slate-300",
        )}
      >
        {usd(total)}
      </p>
    </div>
  );
}

type DayRow = { torneio: string; Lucro: number };
type MonthRow = { dia: string; Lucro: number };
type WeekRow = { dia: string; Lucro: number };
type YearRow = { mes: string; Lucro: number };

type ChartRowBase = {
  LucroPos: number;
  LucroNeg: number;
};

const DEFAULT_CHART_HEIGHT = 420;

function ProfitStackedBars({
  data,
  indexKey,
  chartHeight,
  minWidthClass,
  barCategoryGap,
  xAxisAngle,
  xAxisHeight,
  totalLucro,
}: {
  data: (ChartRowBase & Record<string, string | number>)[];
  indexKey: string;
  chartHeight: number;
  minWidthClass?: string;
  barCategoryGap?: string | number;
  xAxisAngle?: number;
  xAxisHeight?: number;
  totalLucro?: number;
}) {
  const bottomMargin = xAxisAngle ? 48 : 8;
  const showTotalLine = totalLucro !== undefined && Number.isFinite(totalLucro);

  return (
    <div className={cn("w-full min-w-0", minWidthClass)}>
      {showTotalLine ? (
        <div className="mb-2 flex items-center justify-end gap-2 pr-0.5">
          <span
            className="inline-block h-0 w-9 shrink-0 border-t-[1.75px] border-dashed border-sky-400"
            aria-hidden
          />
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            Total {usd(totalLucro)}
          </span>
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: bottomMargin }}
          barCategoryGap={barCategoryGap}
          stackOffset="sign"
          style={{ background: "transparent" }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(148 163 184 / 0.22)"
            vertical={false}
          />
          <XAxis
            dataKey={indexKey}
            tick={tickStyleSmall}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={xAxisAngle}
            textAnchor={xAxisAngle ? "end" : "middle"}
            height={xAxisHeight}
          />
          <YAxis
            width={yAxisMoneyWidth}
            tickFormatter={(v) => usd(Number(v))}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={ProfitTooltipContent}
            cursor={{ fill: "rgba(186, 230, 253, 0.12)" }}
          />
          <Bar
            dataKey="LucroPos"
            stackId="profit"
            fill={FILL_PROFIT_POS}
            name="Lucro"
          />
          <Bar
            dataKey="LucroNeg"
            stackId="profit"
            fill={FILL_PROFIT_NEG}
            name="Lucro"
          />
          {showTotalLine ? (
            <ReferenceLine
              y={totalLucro}
              stroke={STROKE_TOTAL_LINE}
              strokeDasharray="5 5"
              strokeWidth={1.75}
              ifOverflow="extendDomain"
              isFront
            />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type DayChartRow = DayRow & ChartRowBase;
type WeekChartRow = WeekRow & ChartRowBase;

export function DayProfitBarChart({ data }: { data: DayRow[] }) {
  if (data.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        Nenhum torneio neste dia — sem dados para o gráfico.
      </p>
    );
  }

  const chartData: DayChartRow[] = data.map((row) => ({
    ...row,
    ...splitLucro(row.Lucro),
  }));

  const totalLucro = data.reduce((s, r) => s + (Number(r.Lucro) || 0), 0);

  return (
    <div className="mt-6 w-full">
      <div className="glass-chart-surface w-full overflow-x-auto p-4 sm:p-5">
        <Title className="text-base font-semibold text-foreground">
          Lucro por torneio (hoje)
        </Title>
        <Text className="text-sm text-muted-foreground">
          Cada barra é um torneio do dia · valores em USD (lucro pode ser
          negativo)
        </Text>
        <div className="mt-4 w-full min-w-0 pl-1">
          <ProfitStackedBars
            data={chartData}
            indexKey="torneio"
            chartHeight={DEFAULT_CHART_HEIGHT}
            barCategoryGap="8%"
            xAxisAngle={-45}
            xAxisHeight={72}
            totalLucro={totalLucro}
          />
        </div>
      </div>
    </div>
  );
}

export function WeekProfitBarChart({ data }: { data: WeekRow[] }) {
  const chartData: WeekChartRow[] = data.map((row) => ({
    ...row,
    ...splitLucro(row.Lucro),
  }));

  const totalLucro = data.reduce((s, r) => s + (Number(r.Lucro) || 0), 0);

  return (
    <div className="mt-6 w-full">
      <div className="glass-chart-surface w-full overflow-x-auto p-4 sm:p-5">
        <Title className="text-base font-semibold text-foreground">
          Lucro por dia (semana atual)
        </Title>
        <Text className="text-sm text-muted-foreground">
          Todos os dias da semana · dias sem torneio aparecem com $ 0,00
        </Text>
        <div className="mt-4 w-full min-w-0 pl-1">
          <ProfitStackedBars
            data={chartData}
            indexKey="dia"
            chartHeight={DEFAULT_CHART_HEIGHT}
            barCategoryGap="8%"
            xAxisAngle={-45}
            xAxisHeight={72}
            totalLucro={totalLucro}
          />
        </div>
      </div>
    </div>
  );
}

export function YearProfitBarChart({ data }: { data: YearRow[] }) {
  const totalLucro = data.reduce((s, r) => s + (Number(r.Lucro) || 0), 0);
  const showTotalLine = Number.isFinite(totalLucro);

  return (
    <div className="mt-6 w-full">
      <div className="glass-chart-surface w-full overflow-x-auto p-4 sm:p-5">
        <Title className="text-base font-semibold text-foreground">
          Lucro por mês (ano atual)
        </Title>
        <Text className="text-sm text-muted-foreground">
          Todos os meses do ano · meses sem torneio aparecem com $ 0,00
        </Text>
        <div className="mt-4 w-full min-w-0 pl-1">
          {showTotalLine && (
            <div className="mb-2 flex items-center justify-end gap-2 pr-0.5">
              <span
                className="inline-block h-0 w-9 shrink-0 border-t-[1.75px] border-dashed border-sky-400"
                aria-hidden
              />
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                Total {usd(totalLucro)}
              </span>
            </div>
          )}
          <ResponsiveContainer width="100%" height={DEFAULT_CHART_HEIGHT}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              barCategoryGap="30%"
              style={{ background: "transparent" }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(148 163 184 / 0.22)"
                vertical={false}
              />
              <XAxis
                dataKey="mes"
                tick={tickStyleSmall}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={yAxisMoneyWidth}
                tickFormatter={(v) => usd(Number(v))}
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={ProfitTooltipContent}
                cursor={{ fill: "rgba(186, 230, 253, 0.12)" }}
              />
              <Bar dataKey="Lucro" name="Lucro" maxBarSize={80}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-year-${index}`}
                    fill={
                      Number(entry.Lucro) >= 0
                        ? FILL_PROFIT_POS
                        : FILL_PROFIT_NEG
                    }
                  />
                ))}
              </Bar>
              {showTotalLine && (
                <ReferenceLine
                  y={totalLucro}
                  stroke={STROKE_TOTAL_LINE}
                  strokeDasharray="5 5"
                  strokeWidth={1.75}
                  ifOverflow="extendDomain"
                  isFront
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

type MonthChartRow = MonthRow & ChartRowBase;

export function MonthProfitBarChart({ data }: { data: MonthRow[] }) {
  const chartData: MonthChartRow[] = data.map((row) => ({
    ...row,
    ...splitLucro(row.Lucro),
  }));

  const totalLucro = data.reduce((s, r) => s + (Number(r.Lucro) || 0), 0);

  return (
    <div className="mt-6 w-full">
      <div className="glass-chart-surface w-full overflow-x-auto p-4 sm:p-5">
        <Title className="text-base font-semibold text-foreground">
          Lucro por dia (mês atual)
        </Title>
        <Text className="text-sm text-muted-foreground">
          Todos os dias do mês · dias sem torneio aparecem com $ 0,00
        </Text>
        <div className="mt-4 w-full min-w-0 pl-1">
          <ProfitStackedBars
            data={chartData}
            indexKey="dia"
            chartHeight={DEFAULT_CHART_HEIGHT}
            barCategoryGap="8%"
            xAxisAngle={-45}
            xAxisHeight={72}
            totalLucro={totalLucro}
          />
        </div>
      </div>
    </div>
  );
}
