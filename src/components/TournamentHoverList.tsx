"use client";

import type { Tournament } from "@/services/hooks/types";
import { parseTournamentDateLocal } from "@/utils/dateConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";

function formatShortDate(dateStr: string): string {
  try {
    const d = parseTournamentDateLocal(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "—";
  }
}

function formatProfit(t: Tournament): { text: string; positive: boolean } {
  const lucro = getTournamentLucroUsd(t, 1);
  const sign = lucro >= 0 ? "+" : "";
  return {
    text: `${sign}$${lucro.toFixed(2)}`,
    positive: lucro >= 0,
  };
}

interface TournamentListPanelProps {
  title: string;
  tournaments: Tournament[];
  /** When true, the top border-radius is removed (for use below a tab bar) */
  flatTop?: boolean;
}

export function TournamentListPanel({
  title,
  tournaments,
  flatTop = false,
}: TournamentListPanelProps) {
  const shown = tournaments.slice(0, 10);
  const total = tournaments.length;

  return (
    <div
      style={{
        background: "#0a0908",
        border: "1px solid rgba(212,168,67,0.22)",
        boxShadow:
          "0 0 0 1px rgba(212,168,67,0.06), 0 8px 32px rgba(0,0,0,0.7), 0 0 24px rgba(212,168,67,0.07)",
        borderRadius: flatTop ? "0 0 2px 2px" : "2px",
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div
        style={{
          borderBottom: "1px solid rgba(212,168,67,0.14)",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--primary)",
            background: "rgba(212,168,67,0.08)",
            padding: "1px 6px",
            borderRadius: "2px",
          }}
        >
          {total}
        </span>
      </div>

      {/* rows */}
      {shown.length === 0 ? (
        <div
          style={{
            padding: "16px 12px",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "11px",
            color: "var(--muted-foreground)",
            textAlign: "center",
          }}
        >
          Nenhum registro
        </div>
      ) : (
        <div style={{ maxHeight: "220px", overflowY: "auto" }}>
          {shown.map((t, i) => {
            const profit = formatProfit(t);
            return (
              <div
                key={t.id ?? i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr auto",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  borderBottom:
                    i < shown.length - 1
                      ? "1px solid rgba(212,168,67,0.06)"
                      : "none",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "9px",
                    color: "var(--muted-foreground)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {formatShortDate(String(t.date))}
                </span>
                <div style={{ overflow: "hidden" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "var(--foreground)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.3,
                    }}
                  >
                    {t.name || "—"}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: "9px",
                      color: "var(--muted-foreground)",
                      letterSpacing: "0.06em",
                      lineHeight: 1.3,
                      marginTop: "1px",
                    }}
                  >
                    {t.platform}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: profit.positive
                      ? "var(--pk-success)"
                      : "var(--destructive)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {profit.text}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {total > 10 && (
        <div
          style={{
            borderTop: "1px solid rgba(212,168,67,0.1)",
            padding: "5px 12px",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: "9px",
            color: "var(--muted-foreground)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          mostrando 10 de {total}
        </div>
      )}
    </div>
  );
}

interface TournamentHoverListProps {
  title: string;
  tournaments: Tournament[];
  visible: boolean;
  align?: "left" | "right";
}

export function TournamentHoverList({
  title,
  tournaments,
  visible,
  align = "left",
}: TournamentHoverListProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        zIndex: 50,
        width: "288px",
        pointerEvents: "none",
        transition: "opacity 200ms ease-out, transform 200ms ease-out",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        ...(align === "right" ? { right: 0 } : { left: 0 }),
      }}
    >
      <TournamentListPanel title={title} tournaments={tournaments} />

      {/* arrow */}
      <div
        style={{
          position: "absolute",
          bottom: "-5px",
          ...(align === "right" ? { right: "18px" } : { left: "18px" }),
          width: "8px",
          height: "5px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            background: "#0a0908",
            border: "1px solid rgba(212,168,67,0.22)",
            transform: "rotate(45deg)",
            transformOrigin: "center",
            marginTop: "-4px",
          }}
        />
      </div>
    </div>
  );
}
