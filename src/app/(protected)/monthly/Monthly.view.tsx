"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMonthlyViewModel } from "./monthly.viewmodel";
import type { MonthlyStats } from "./monthly.types";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTH_SHORT = [
  "Jan", "Fev", "Mar", "Abr",
  "Mai", "Jun", "Jul", "Ago",
  "Set", "Out", "Nov", "Dez",
];

function fmt(n: number): string {
  return n.toFixed(2);
}

function profitColor(n: number): string {
  if (n > 0) return "var(--pk-success)";
  if (n < 0) return "var(--destructive)";
  return "var(--muted-foreground)";
}

function profitSign(n: number): string {
  if (n > 0) return "+";
  return "";
}

interface MonthCardProps {
  stats: MonthlyStats;
  maxAbsProfit: number;
  isCurrentMonth: boolean;
}

function MonthCard({ stats, maxAbsProfit, isCurrentMonth }: MonthCardProps) {
  const empty = stats.count === 0;
  const barWidth =
    maxAbsProfit > 0 ? Math.abs(stats.profit) / maxAbsProfit : 0;
  const isProfit = stats.profit >= 0;

  return (
    <div
      className="glass-panel rounded-2xl p-1 flex flex-col"
      style={{
        opacity: empty ? 0.38 : 1,
        outline: isCurrentMonth
          ? "1px solid rgba(212,168,67,0.4)"
          : undefined,
      }}
    >
      <div className="glass-inner rounded-xl p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p
              className="font-display text-xs uppercase tracking-[0.14em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {MONTH_SHORT[stats.month]}
            </p>
            <p
              className="font-data text-lg font-semibold leading-tight mt-0.5"
              style={{ color: profitColor(stats.profit) }}
            >
              {empty
                ? "—"
                : `${profitSign(stats.profit)}$${fmt(stats.profit)}`}
            </p>
          </div>
          {!empty && (
            <span
              className="font-data text-[10px] tabular-nums"
              style={{ color: "var(--muted-foreground)" }}
            >
              {stats.count} torneios
            </span>
          )}
        </div>

        {/* Secondary stats */}
        {!empty && (
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.12em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                ITM
              </p>
              <p className="font-data text-xs text-text-primary">
                {stats.itmRate.toFixed(0)}%
                <span
                  className="ml-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  ({stats.itmCount})
                </span>
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.12em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                ABI
              </p>
              <p className="font-data text-xs text-text-primary">
                ${fmt(stats.abi)}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.12em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Buy-in total
              </p>
              <p className="font-data text-xs text-text-primary">
                ${fmt(stats.totalBuyIn)}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.12em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Dias
              </p>
              <p className="font-data text-xs text-text-primary">
                {stats.days}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.12em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                FT
              </p>
              <p className="font-data text-xs text-text-primary">
                {stats.ftCount}
              </p>
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.12em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Pódio
              </p>
              <p className="font-data text-xs text-text-primary flex items-center gap-1">
                {stats.goldCount > 0 && (
                  <span title="1º lugar">🥇{stats.goldCount}</span>
                )}
                {stats.silverCount > 0 && (
                  <span title="2º lugar">🥈{stats.silverCount}</span>
                )}
                {stats.bronzeCount > 0 && (
                  <span title="3º lugar">🥉{stats.bronzeCount}</span>
                )}
                {stats.goldCount === 0 && stats.silverCount === 0 && stats.bronzeCount === 0 && (
                  <span style={{ color: "var(--muted-foreground)" }}>—</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Profit bar */}
        {!empty && (
          <div
            className="mt-auto rounded-full overflow-hidden"
            style={{
              height: "3px",
              background: "var(--pk-deep-dim)",
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(barWidth * 100).toFixed(1)}%`,
                background: isProfit
                  ? "var(--pk-success)"
                  : "var(--destructive)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function MonthlyView() {
  const {
    isLoading,
    selectedYear,
    availableYears,
    months,
    yearTotals,
    onYearChange,
  } = useMonthlyViewModel();

  const now = new Date();
  const currentCalYear = now.getFullYear();
  const currentCalMonth = now.getMonth();

  const maxAbsProfit = Math.max(...months.map((m) => Math.abs(m.profit)), 0);

  const canGoPrev =
    availableYears.indexOf(selectedYear) < availableYears.length - 1;
  const canGoNext = availableYears.indexOf(selectedYear) > 0;

  const goPrev = () => {
    const idx = availableYears.indexOf(selectedYear);
    if (idx < availableYears.length - 1) onYearChange(availableYears[idx + 1]);
  };

  const goNext = () => {
    const idx = availableYears.indexOf(selectedYear);
    if (idx > 0) onYearChange(availableYears[idx - 1]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="font-data text-sm tracking-[0.1em] uppercase text-text-secondary animate-pulse">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[90%] mx-auto mt-8 gap-8">
      {/* Page header */}
      <header style={{ borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
        <p
          className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          Histórico
        </p>
        <div className="flex items-end justify-between">
          <h1 className="font-display text-3xl font-bold text-text-primary leading-none">
            Performance mensal
          </h1>

          {/* Year navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="flex items-center justify-center w-7 h-7 transition-colors duration-200 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
              style={{ border: "1px solid var(--pk-panel-top)", borderRadius: "2px" }}
            >
              <ChevronLeft size={13} style={{ color: "var(--primary)" }} />
            </button>
            <span className="font-display text-2xl font-bold text-gold w-16 text-center tabular-nums">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="flex items-center justify-center w-7 h-7 transition-colors duration-200 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
              style={{ border: "1px solid var(--pk-panel-top)", borderRadius: "2px" }}
            >
              <ChevronRight size={13} style={{ color: "var(--primary)" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Annual summary strip */}
      <div className="glass-panel rounded-2xl p-1">
        <div className="glass-inner rounded-xl px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {[
              {
                label: "Profit anual",
                value: `${profitSign(yearTotals.profit)}$${fmt(yearTotals.profit)}`,
                color: profitColor(yearTotals.profit),
                large: true,
              },
              {
                label: "Torneios",
                value: String(yearTotals.count),
                color: "var(--foreground)",
              },
              {
                label: "ITM",
                value: `${yearTotals.itmRate.toFixed(1)}%`,
                color: "var(--foreground)",
              },
              {
                label: "ABI médio",
                value: `$${fmt(yearTotals.abi)}`,
                color: "var(--foreground)",
              },
              {
                label: "Buy-in total",
                value: `$${fmt(yearTotals.totalBuyIn)}`,
                color: "var(--foreground)",
              },
              {
                label: "Dias jogados",
                value: String(yearTotals.days),
                color: "var(--foreground)",
              },
            ].map((item) => (
              <div key={item.label}>
                <p
                  className="text-[9px] uppercase tracking-[0.14em] mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {item.label}
                </p>
                <p
                  className={`font-data font-semibold tabular-nums ${item.large ? "text-xl" : "text-sm"}`}
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-10">
        {months.map((m) => (
          <MonthCard
            key={m.month}
            stats={m}
            maxAbsProfit={maxAbsProfit}
            isCurrentMonth={
              selectedYear === currentCalYear && m.month === currentCalMonth
            }
          />
        ))}
      </div>
    </div>
  );
}
