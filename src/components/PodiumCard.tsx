"use client";

import { useState } from "react";
import type { Tournament } from "@/services/hooks/types";
import { TournamentListPanel } from "./TournamentHoverList";
import { Card } from "./ui/card";

interface PodiumCardProps {
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  goldTournaments?: Tournament[];
  silverTournaments?: Tournament[];
  bronzeTournaments?: Tournament[];
  variant?: "elevated" | "nested";
}

type Medal = "gold" | "silver" | "bronze";

const MEDALS: { key: Medal; emoji: string }[] = [
  { key: "gold", emoji: "🥇" },
  { key: "silver", emoji: "🥈" },
  { key: "bronze", emoji: "🥉" },
];

export function PodiumCard({
  goldCount,
  silverCount,
  bronzeCount,
  goldTournaments = [],
  silverTournaments = [],
  bronzeTournaments = [],
  variant = "elevated",
}: PodiumCardProps) {
  const [hovered, setHovered] = useState(false);
  const [activeMedal, setActiveMedal] = useState<Medal>("gold");

  const surface =
    variant === "nested"
      ? "glass-inner w-full border-0 bg-transparent py-4 px-4 shadow-none text-text-primary"
      : "glass-panel w-full border-0 bg-transparent py-5 px-5 shadow-none text-text-primary";

  const tournamentsMap: Record<Medal, Tournament[]> = {
    gold: goldTournaments,
    silver: silverTournaments,
    bronze: bronzeTournaments,
  };

  const countMap: Record<Medal, number> = {
    gold: goldCount,
    silver: silverCount,
    bronze: bronzeCount,
  };

  const labelMap: Record<Medal, string> = {
    gold: "1º lugar",
    silver: "2º lugar",
    bronze: "3º lugar",
  };

  const hasTournamentData =
    goldTournaments.length > 0 ||
    silverTournaments.length > 0 ||
    bronzeTournaments.length > 0;

  return (
    <div
      className="relative flex-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hasTournamentData && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            right: 0,
            zIndex: 50,
            width: "300px",
            pointerEvents: hovered ? "auto" : "none",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 200ms ease-out, transform 200ms ease-out",
          }}
        >
          {/* medal tab bar */}
          <div
            style={{
              background: "#0a0908",
              border: "1px solid rgba(212,168,67,0.22)",
              borderBottom: "none",
              borderRadius: "2px 2px 0 0",
              display: "flex",
              padding: "6px 8px 0",
              gap: "2px",
            }}
          >
            {MEDALS.map(({ key, emoji }) => {
              const isActive = activeMedal === key;
              return (
                <button
                  key={key}
                  type="button"
                  onMouseEnter={() => setActiveMedal(key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 12px 6px",
                    border: "none",
                    borderRadius: "2px 2px 0 0",
                    cursor: "pointer",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "11px",
                    fontWeight: isActive ? 600 : 400,
                    background: isActive
                      ? "rgba(212,168,67,0.1)"
                      : "transparent",
                    color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                    borderBottom: isActive
                      ? "1.5px solid rgba(212,168,67,0.4)"
                      : "1.5px solid transparent",
                    transition: "all 120ms ease",
                  }}
                >
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>{emoji}</span>
                  <span>{countMap[key]}</span>
                </button>
              );
            })}

            <span
              style={{
                marginLeft: "auto",
                alignSelf: "center",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
                paddingRight: "4px",
                paddingBottom: "4px",
              }}
            >
              {labelMap[activeMedal]}
            </span>
          </div>

          <TournamentListPanel
            title={`${MEDALS.find((m) => m.key === activeMedal)?.emoji ?? ""} últimos registros`}
            tournaments={tournamentsMap[activeMedal]}
            flatTop
          />

          {/* arrow */}
          <div
            style={{
              position: "absolute",
              bottom: "-5px",
              right: "18px",
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
      )}

      <Card className={surface}>
        <p className="activity-card-title">Pódios</p>
        <div className="flex items-center gap-4 mt-1">
          {MEDALS.map(({ key, emoji }) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className="text-xl leading-none">{emoji}</span>
              <span className="activity-card-value">{countMap[key]}</span>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
