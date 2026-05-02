"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAnalyticsViewModel } from "./analytics.viewmodel";
import type { BankCurvePoint, HeatmapEntry, PeriodStats, StreakInfo } from "./analytics.types";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const fmtUsd = (v: number) =>
  `${v < 0 ? "-" : ""}$ ${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SUCCESS = "#3db87a";
const DANGER = "#c44040";
const GOLD = "#d4a843";
const MUTED = "#7a7068";
const TICK = { fill: MUTED, fontSize: 10 };

/* ── Section label ────────────────────────────────────────────────────────── */

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-data text-[10px] tracking-[0.3em]" style={{ color: GOLD }}>
        {index}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.18em] font-medium"
        style={{ color: MUTED }}
      >
        {title}
      </span>
      <span className="flex-1 h-px" style={{ background: "var(--border)" }} aria-hidden />
    </div>
  );
}

/* ── Curve tooltip ────────────────────────────────────────────────────────── */

type TooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number }>;
  label?: string;
};

function CurveTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const balance = Number(payload[0]?.value ?? 0);
  return (
    <div
      style={{
        background: "rgba(8,8,8,0.96)",
        border: "1px solid rgba(212,168,67,0.18)",
        padding: "8px 12px",
        borderRadius: "2px",
      }}
    >
      <p className="font-data text-[11px]" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="font-data text-sm font-semibold" style={{ color: balance >= 0 ? SUCCESS : DANGER }}>
        {fmtUsd(balance)}
      </p>
    </div>
  );
}

function HeatmapTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const avg = Number(payload[0]?.value ?? 0);
  return (
    <div
      style={{
        background: "rgba(8,8,8,0.96)",
        border: "1px solid rgba(212,168,67,0.18)",
        padding: "8px 12px",
        borderRadius: "2px",
      }}
    >
      <p className="font-data text-[11px]" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="font-data text-sm font-semibold" style={{ color: avg >= 0 ? SUCCESS : DANGER }}>
        Méd: {fmtUsd(avg)}
      </p>
    </div>
  );
}

/* ── Section 01 — Bankroll Curve ──────────────────────────────────────────── */

function BankrollCurve({
  curve,
  currentBalance,
}: {
  curve: BankCurvePoint[];
  currentBalance: number;
}) {
  const tickInterval = Math.max(0, Math.floor(curve.length / 8) - 1);

  return (
    <section>
      <SectionLabel index="01" title="Evolução da banca" />
      <div className="glass-panel px-4 pt-5 pb-3">
        <div className="flex items-end justify-between mb-5 px-2">
          <p className="font-data text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
            Saldo acumulado
          </p>
          <p
            className="font-data text-xl font-semibold"
            style={{ color: currentBalance >= 0 ? SUCCESS : DANGER }}
          >
            {fmtUsd(currentBalance)}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={curve} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.22} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.07)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={TICK}
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
            />
            <YAxis
              width={80}
              tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
              tick={TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={CurveTooltip} cursor={{ stroke: "rgba(212,168,67,0.2)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={GOLD}
              strokeWidth={1.5}
              fill="url(#balanceGradient)"
              dot={false}
              activeDot={{ r: 3, fill: GOLD, stroke: "none" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/* ── Section 02 — Period Comparison ──────────────────────────────────────── */

function PeriodComparison({
  thisMonth,
  lastMonth,
  thisMonthName,
  lastMonthName,
}: {
  thisMonth: PeriodStats;
  lastMonth: PeriodStats;
  thisMonthName: string;
  lastMonthName: string;
}) {
  const CELL_BORDER = "1px solid rgba(212,168,67,0.07)";

  const rows: { label: string; this: string; last: string; positiveThis?: boolean; positiveLast?: boolean }[] = [
    {
      label: "Lucro",
      this: fmtUsd(thisMonth.profit),
      last: fmtUsd(lastMonth.profit),
      positiveThis: thisMonth.profit >= 0,
      positiveLast: lastMonth.profit >= 0,
    },
    {
      label: "ROI %",
      this: `${thisMonth.roi >= 0 ? "+" : ""}${thisMonth.roi.toFixed(1)}%`,
      last: `${lastMonth.roi >= 0 ? "+" : ""}${lastMonth.roi.toFixed(1)}%`,
      positiveThis: thisMonth.roi >= 0,
      positiveLast: lastMonth.roi >= 0,
    },
    {
      label: "ABI",
      this: fmtUsd(thisMonth.abi),
      last: fmtUsd(lastMonth.abi),
    },
    {
      label: "ITM %",
      this: `${thisMonth.itmPct.toFixed(1)}%`,
      last: `${lastMonth.itmPct.toFixed(1)}%`,
    },
    {
      label: "Torneios",
      this: String(thisMonth.count),
      last: String(lastMonth.count),
    },
  ];

  return (
    <section>
      <SectionLabel index="02" title="Comparação de períodos" />
      <div className="glass-panel overflow-x-auto">
        <div style={{ minWidth: "380px" }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              borderBottom: "1px solid rgba(212,168,67,0.12)",
            }}
          >
            <div className="px-5 py-3" />
            {[thisMonthName, lastMonthName].map((name) => (
              <div key={name} className="px-5 py-3" style={{ borderLeft: CELL_BORDER }}>
                <span
                  className="font-data text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: MUTED }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="grid"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr",
                borderBottom: i < rows.length - 1 ? "1px solid rgba(212,168,67,0.06)" : "none",
              }}
            >
              <div className="px-5 py-4">
                <span
                  className="font-data text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: MUTED }}
                >
                  {row.label}
                </span>
              </div>
              <div className="px-5 py-4" style={{ borderLeft: CELL_BORDER }}>
                <span
                  className="font-data text-sm font-semibold"
                  style={{
                    color:
                      row.positiveThis === undefined
                        ? "var(--foreground)"
                        : row.positiveThis
                          ? SUCCESS
                          : DANGER,
                  }}
                >
                  {row.this}
                </span>
              </div>
              <div className="px-5 py-4" style={{ borderLeft: CELL_BORDER }}>
                <span
                  className="font-data text-sm font-semibold"
                  style={{
                    color:
                      row.positiveLast === undefined
                        ? "var(--foreground)"
                        : row.positiveLast
                          ? SUCCESS
                          : DANGER,
                  }}
                >
                  {row.last}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 03 — Heatmap ─────────────────────────────────────────────────── */

function DowHeatmap({ heatmap }: { heatmap: HeatmapEntry[] }) {
  return (
    <section>
      <SectionLabel index="03" title="Lucro médio por dia da semana" />
      <div className="glass-panel px-4 pt-5 pb-3">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={heatmap} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.07)" vertical={false} />
            <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false} />
            <YAxis
              width={80}
              tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
              tick={TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={HeatmapTooltip} cursor={{ fill: "rgba(212,168,67,0.05)" }} />
            <Bar dataKey="avg" name="Méd. lucro" radius={[2, 2, 0, 0]}>
              {heatmap.map((entry, i) => (
                <Cell key={`dow-${i}`} fill={entry.avg >= 0 ? SUCCESS : DANGER} fillOpacity={0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 justify-end mt-2 px-2">
          {heatmap.map((e) => (
            <span key={e.day} className="font-data text-[9px]" style={{ color: MUTED }}>
              {e.day}: {e.count}t
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 04 — Streaks ─────────────────────────────────────────────────── */

function StreakCards({ streaks }: { streaks: StreakInfo }) {
  const currentColor =
    streaks.currentStreakType === "win"
      ? SUCCESS
      : streaks.currentStreakType === "loss"
        ? DANGER
        : MUTED;

  const currentLabel =
    streaks.currentStreakType === "win"
      ? "dias positivos"
      : streaks.currentStreakType === "loss"
        ? "dias negativos"
        : "sem dados";

  const cards = [
    {
      tag: "◆ MAX POSITIVO",
      value: `${streaks.maxWinStreak}`,
      sub: "dias consecutivos no lucro",
      color: SUCCESS,
    },
    {
      tag: "◆ MAX NEGATIVO",
      value: `${streaks.maxLossStreak}`,
      sub: "dias consecutivos no prejuízo",
      color: DANGER,
    },
    {
      tag: "◆ SEQUÊNCIA ATUAL",
      value: `${streaks.currentStreak}`,
      sub: currentLabel,
      color: currentColor,
    },
  ];

  return (
    <section>
      <SectionLabel index="04" title="Sequências" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.tag} className="glass-panel py-6 px-6">
            <p className="font-data text-[9px] tracking-[0.22em] mb-4" style={{ color: c.color }}>
              {c.tag}
            </p>
            <p
              className="font-data font-semibold leading-none"
              style={{ fontSize: "clamp(36px,5vw,52px)", color: "var(--foreground)" }}
            >
              {c.value}
            </p>
            <p className="font-data text-[11px] mt-3" style={{ color: MUTED }}>
              {c.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Main view ────────────────────────────────────────────────────────────── */

export function AnalyticsView() {
  const {
    isLoading,
    hasCurveData,
    curve,
    currentBalance,
    thisMonth,
    lastMonth,
    thisMonthName,
    lastMonthName,
    heatmap,
    streaks,
  } = useAnalyticsViewModel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-data text-sm tracking-[0.1em] uppercase animate-pulse" style={{ color: MUTED }}>
          Carregando análise…
        </p>
      </div>
    );
  }

  if (!hasCurveData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-data text-sm tracking-[0.1em] uppercase" style={{ color: MUTED }}>
          Sem dados suficientes para análise
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[90%] mx-auto mt-10 gap-12 pb-16">
      <header
        className="flex items-end justify-between pb-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
            style={{ color: MUTED }}
          >
            Análise avançada
          </p>
          <h1
            className="font-display text-3xl font-bold text-text-primary leading-none"
            style={{ letterSpacing: "0.02em" }}
          >
            Evolução
          </h1>
        </div>
        <p className="font-data text-[11px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
          Todos os registros
        </p>
      </header>

      <BankrollCurve curve={curve} currentBalance={currentBalance} />

      <PeriodComparison
        thisMonth={thisMonth}
        lastMonth={lastMonth}
        thisMonthName={thisMonthName}
        lastMonthName={lastMonthName}
      />

      <DowHeatmap heatmap={heatmap} />

      <StreakCards streaks={streaks} />
    </div>
  );
}
