"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlatformTag } from "@/components/PlatformTag";
import { parseTournamentDateLocal } from "@/utils/dateConvert";
import type { MonthlyRecapTournament } from "@/utils/useMonthlyRecap";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const POSITION_BADGE: Record<number, { label: string; color: string }> = {
  1: { label: "1º", color: "#f0c040" },
  2: { label: "2º", color: "#b0b8c8" },
  3: { label: "3º", color: "#b87333" },
};

interface MonthlyRecapModalProps {
  open: boolean;
  onClose: () => void;
  tournaments: MonthlyRecapTournament[];
  prevMonth: number;
  prevYear: number;
}

function formatDate(dateStr: string): string {
  const d = parseTournamentDateLocal(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthlyRecapModal({
  open,
  onClose,
  tournaments,
  prevMonth,
  prevYear,
}: MonthlyRecapModalProps) {
  const monthName = MONTHS_PT[prevMonth];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md overflow-hidden",
            "glass-panel",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-4 select-none text-[110px] leading-none"
            style={{ color: "var(--primary)", opacity: 0.04, fontFamily: "serif" }}
          >
            ◆
          </div>

          {/* Header */}
          <div
            className="relative px-6 pt-6 pb-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p
              className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Fechamento de {monthName} {prevYear}
            </p>
            <DialogPrimitive.Title
              className="font-display text-2xl font-bold leading-none"
              style={{ color: "var(--foreground)", letterSpacing: "0.02em" }}
            >
              Destaques do Mês
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-50 transition-opacity hover:opacity-100 focus:outline-none"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          </div>

          {/* Tournament list */}
          <div className="flex flex-col px-6 py-2 max-h-[50vh] overflow-y-auto">
            {tournaments.map((t, i) => {
              const posBadge = t.position != null ? POSITION_BADGE[t.position] : null;
              return (
                <div
                  key={t.id ?? i}
                  className="flex items-center gap-3 py-3.5"
                  style={{
                    borderBottom:
                      i < tournaments.length - 1 ? "1px solid var(--border)" : "none",
                    animation: "stat-reveal 0.4s ease both",
                    animationDelay: `${i * 90 + 60}ms`,
                  }}
                >
                  {posBadge && (
                    <span
                      className="font-data flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        color: posBadge.color,
                        background: `color-mix(in srgb, ${posBadge.color} 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${posBadge.color} 30%, transparent)`,
                      }}
                    >
                      {posBadge.label}
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-display text-sm font-semibold leading-snug truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {t.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <PlatformTag platform={t.platform} />
                      <span
                        className="font-data text-[10px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {formatDate(String(t.date))}
                      </span>
                    </div>
                  </div>

                  <p
                    className="font-data text-sm font-bold flex-shrink-0"
                    style={{ color: "var(--pk-success)" }}
                  >
                    ${t.resultUsd.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onClose}
              className="btn-gold w-full py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              Fechar
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
