"use client";

import { useState, useRef } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useGoals,
  type PrevMonthSummary,
  type PrevYearSummary,
} from "@/utils/useGoals";

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const MONTH_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function moneyAbs(n: number): string {
  return `$ ${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function moneyGoal(n: number): string {
  return `$ ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatGoalMonth(monthKey: string): string {
  const [year, mon] = monthKey.split("-");
  const idx = parseInt(mon ?? "1") - 1;
  return `${MONTH_PT[idx] ?? mon} ${year}`;
}

/* ─── Circular ring ────────────────────────────────────────────────────── */

function CircularRing({ pct }: { pct: number }) {
  const radius = 44;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * radius;

  // Visual ring fills up to 100%; text can exceed it
  const clamped = Math.min(Math.max(pct, 0), 100);
  const offset = circumference * (1 - clamped / 100);

  const ringColor =
    pct >= 100 ? "#3db87a"
    : pct >= 50 ? "#d4a843"
    : pct > 0 ? "#c44040"
    : "rgba(255,255,255,0.06)";

  const textColor = pct > 0 ? ringColor : "#4a433c";
  const label = pct <= 0 ? "0%" : `${Math.round(pct)}%`;

  return (
    <svg
      width={112}
      height={112}
      viewBox="0 0 112 112"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={8}
      />
      {/* Progress arc */}
      {pct > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease",
          }}
        />
      )}
      {/* Center label */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        style={{
          fontSize: "17px",
          fontWeight: 600,
          fontFamily: "var(--font-mono, monospace)",
          transition: "fill 0.3s ease",
        }}
      >
        {label}
      </text>
    </svg>
  );
}

/* ─── Goal input (shown when no goal is set) ───────────────────────────── */

function GoalInput({
  onSet,
  placeholder,
}: {
  onSet: (v: number) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSet() {
    const n = parseFloat(value.replace(",", "."));
    if (Number.isFinite(n) && n > 0) {
      onSet(n);
      setValue("");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <p
        className="font-data text-[10px] uppercase tracking-[0.18em]"
        style={{ color: "#7a7068" }}
      >
        Definir meta em USD
      </p>
      <div className="flex items-center gap-2">
        <span className="font-data text-sm" style={{ color: "#7a7068" }}>
          $
        </span>
        <Input
          ref={inputRef}
          type="number"
          min={1}
          step={100}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSet()}
          className="h-8 w-28 rounded-lg border-white/10 bg-white/5 px-2 text-right text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-yellow-500/50"
        />
        <button
          onClick={handleSet}
          disabled={!value || parseFloat(value) <= 0}
          className="h-8 rounded-lg px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "rgba(212,168,67,0.15)", color: "#d4a843" }}
        >
          Definir
        </button>
      </div>
    </div>
  );
}

/* ─── Prev-period summary badge ────────────────────────────────────────── */

function PrevMonthBadge({ summary }: { summary: PrevMonthSummary }) {
  const met = summary.met;
  const color = met ? "#3db87a" : "#c44040";
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className="font-data text-[9px] uppercase tracking-[0.2em]"
        style={{ color: "#7a7068" }}
      >
        {formatGoalMonth(summary.month)}
      </span>
      <span
        className="font-data text-[11px] font-semibold"
        style={{ color }}
      >
        {met ? "✓" : "✗"} {moneyAbs(summary.achieved)}
      </span>
      <span className="font-data text-[9px]" style={{ color: "#7a7068" }}>
        meta: {moneyGoal(summary.goal)}
      </span>
    </div>
  );
}

function PrevYearBadge({ summary }: { summary: PrevYearSummary }) {
  const met = summary.met;
  const color = met ? "#3db87a" : "#c44040";
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span
        className="font-data text-[9px] uppercase tracking-[0.2em]"
        style={{ color: "#7a7068" }}
      >
        {summary.year}
      </span>
      <span
        className="font-data text-[11px] font-semibold"
        style={{ color }}
      >
        {met ? "✓" : "✗"} {moneyAbs(summary.achieved)}
      </span>
      <span className="font-data text-[9px]" style={{ color: "#7a7068" }}>
        meta: {moneyGoal(summary.goal)}
      </span>
    </div>
  );
}

/* ─── Goal card ─────────────────────────────────────────────────────────── */

function GoalCard({
  badge,
  title,
  goal,
  currentProfit,
  inputPlaceholder,
  onSetGoal,
  onClearGoal,
  prevSummarySlot,
}: {
  badge: string;
  title: string;
  goal: number | null;
  currentProfit: number;
  inputPlaceholder: string;
  onSetGoal: (v: number) => void;
  onClearGoal: () => void;
  prevSummarySlot: React.ReactNode;
}) {
  const pct =
    goal !== null && goal > 0 ? (currentProfit / goal) * 100 : 0;

  const profitColor =
    currentProfit > 0 ? "#3db87a"
    : currentProfit < 0 ? "#c44040"
    : "#7a7068";

  return (
    <article className="glass-panel relative flex flex-col rounded-3xl p-5 min-h-[240px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-0.5">
          <span
            className="font-data text-[9px] tracking-[0.22em]"
            style={{ color: "#d4a843" }}
          >
            {badge}
          </span>
          <h3
            className="text-lg font-semibold tracking-tight"
            style={{ color: "#f0ede8" }}
          >
            {title}
          </h3>
        </div>
        {goal !== null && (
          <button
            onClick={onClearGoal}
            title="Redefinir meta"
            className="mt-0.5 rounded-md p-1.5 transition-colors hover:bg-white/5"
            aria-label="Redefinir meta"
          >
            <Pencil size={12} style={{ color: "#7a7068" }} />
          </button>
        )}
      </div>

      {/* Body */}
      {goal === null ? (
        <GoalInput onSet={onSetGoal} placeholder={inputPlaceholder} />
      ) : (
        <div className="flex flex-col items-center gap-2 pt-1">
          <CircularRing pct={pct} />
          <p className="font-data text-sm font-semibold text-center">
            <span style={{ color: profitColor }}>
              {currentProfit < 0 ? "- " : ""}
              {moneyAbs(currentProfit)}
            </span>
            <span style={{ color: "#7a7068" }}> / </span>
            <span style={{ color: "#d4a843" }}>{moneyGoal(goal)}</span>
          </p>
        </div>
      )}

      {/* Prev period summary — bottom-right corner */}
      {prevSummarySlot && (
        <div className="absolute bottom-4 right-5">{prevSummarySlot}</div>
      )}
    </article>
  );
}

/* ─── Exported component ────────────────────────────────────────────────── */

type GoalProgressProps = {
  monthlyProfitUsd: number;
  yearlyProfitUsd: number;
};

export function GoalProgress({
  monthlyProfitUsd,
  yearlyProfitUsd,
}: GoalProgressProps) {
  const {
    monthlyGoal,
    annualGoal,
    prevMonthSummary,
    prevYearSummary,
    setMonthlyGoal,
    setAnnualGoal,
    clearMonthlyGoal,
    clearAnnualGoal,
  } = useGoals(monthlyProfitUsd, yearlyProfitUsd);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
        Metas
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GoalCard
          badge="◆ MENSAL"
          title="Meta do mês"
          goal={monthlyGoal}
          currentProfit={monthlyProfitUsd}
          inputPlaceholder="1000"
          onSetGoal={setMonthlyGoal}
          onClearGoal={clearMonthlyGoal}
          prevSummarySlot={
            prevMonthSummary ? (
              <PrevMonthBadge summary={prevMonthSummary} />
            ) : null
          }
        />
        <GoalCard
          badge="◆ ANUAL"
          title="Meta do ano"
          goal={annualGoal}
          currentProfit={yearlyProfitUsd}
          inputPlaceholder="12000"
          onSetGoal={setAnnualGoal}
          onClearGoal={clearAnnualGoal}
          prevSummarySlot={
            prevYearSummary ? (
              <PrevYearBadge summary={prevYearSummary} />
            ) : null
          }
        />
      </div>
    </section>
  );
}
