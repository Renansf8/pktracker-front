"use client";

import { Card } from "@/components/ui/card";
import type {
  StatsBiggestBuyIn,
  StatsHighestAbiDay,
  StatsMostTournamentsInADay,
  Tournament,
} from "@/services/hooks/types";
import type { BucketCardData, PodiumByPosition, StatsPlatformEntry } from "./stats.types";
import { getTournamentProfitNative } from "@/utils/tournamentLucro";
import { useStatsViewModel } from "./stats.viewmodel";

/* ─────────────────────────────────────────────────────────────────────────
 * Date helpers
 * ────────────────────────────────────────────────────────────────────────*/

const MONTH_NAMES_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function parseUtcParts(iso: string) {
  const d = new Date(iso);
  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth(),
    year: d.getUTCFullYear(),
    valid: !Number.isNaN(d.getTime()),
  };
}

function formatDayFull(iso: string): string {
  const p = parseUtcParts(iso);
  if (!p.valid) return "—";
  const dd = String(p.day).padStart(2, "0");
  const mm = String(p.month + 1).padStart(2, "0");
  return `${dd}/${mm}/${p.year}`;
}

function formatWeek(iso: string): string {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return "—";
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const dd1 = String(start.getUTCDate()).padStart(2, "0");
  const mm1 = String(start.getUTCMonth() + 1).padStart(2, "0");
  const dd2 = String(end.getUTCDate()).padStart(2, "0");
  const mm2 = String(end.getUTCMonth() + 1).padStart(2, "0");
  return `${dd1}/${mm1}—${dd2}/${mm2}`;
}

function formatMonth(iso: string): string {
  const p = parseUtcParts(iso);
  if (!p.valid) return "—";
  return `${MONTH_NAMES_PT[p.month]} · ${p.year}`;
}

function formatYear(iso: string): string {
  const p = parseUtcParts(iso);
  if (!p.valid) return "—";
  return String(p.year);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} · ${hh}:${mi}`;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "-" : ""}$ ${formatted}`;
}

function formatBucketPeriod(data: BucketCardData): string {
  if (!data.record) return "Sem registro";
  switch (data.range) {
    case "day":   return formatDayFull(data.record.bucketStart);
    case "week":  return formatWeek(data.record.bucketStart);
    case "month": return formatMonth(data.record.bucketStart);
    case "year":  return formatYear(data.record.bucketStart);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Animation helper
 * ────────────────────────────────────────────────────────────────────────*/

function revealed(delayMs: number): React.CSSProperties {
  return {
    animation: "stat-reveal 0.55s cubic-bezier(0.16,1,0.3,1) both",
    animationDelay: `${delayMs}ms`,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * SectionLabel
 * ────────────────────────────────────────────────────────────────────────*/

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span
        className="font-data text-[10px] tracking-[0.3em]"
        style={{ color: "var(--primary)" }}
      >
        {index}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.18em] font-medium"
        style={{ color: "var(--muted-foreground)" }}
      >
        {title}
      </span>
      <span
        className="flex-1 h-px"
        style={{ background: "var(--border)" }}
        aria-hidden="true"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Stat Strip — aggregate overview line under the header
 * ────────────────────────────────────────────────────────────────────────*/

function StatStrip({
  totalTournaments,
  itmRate,
  ftRate,
  platformCount,
}: {
  totalTournaments: number;
  itmRate: number;
  ftRate: number;
  platformCount: number;
}) {
  const items = [
    { label: "TORNEIOS", value: String(totalTournaments) },
    { label: "PLATAFORMAS", value: String(platformCount) },
    { label: "ITM", value: `${itmRate.toFixed(1)}%` },
    { label: "FT", value: `${ftRate.toFixed(1)}%` },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4"
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <span
            className="font-data text-lg font-semibold leading-none"
            style={{ color: "var(--foreground)" }}
          >
            {item.value}
          </span>
          <span
            className="font-data text-[9px] uppercase tracking-[0.22em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Section 01 — Records Hero
 * ────────────────────────────────────────────────────────────────────────*/

function BiggestBuyInHero({ data }: { data: StatsBiggestBuyIn | null }) {
  return (
    <Card className="glass-panel border-0 bg-transparent shadow-none text-text-primary flex flex-col h-full min-h-[220px] py-7 px-8">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">Maior buy-in registrado</p>
        <span
          className="font-data text-[9px] tracking-[0.22em]"
          style={{ color: "var(--primary)" }}
        >
          ◆ RECORDE
        </span>
      </div>

      {data ? (
        <>
          <p
            className="font-data font-semibold leading-none mt-5"
            style={{
              fontSize: "clamp(40px,6vw,60px)",
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}
          >
            ${" "}{data.value.toFixed(2)}
          </p>
          <div
            className="mt-auto pt-5 flex items-end justify-between"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div>
              <p
                className="font-display text-sm font-semibold leading-tight"
                style={{ color: "var(--foreground)" }}
              >
                {data.tournament.name}
              </p>
              <p
                className="font-data text-[11px] mt-1.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                {data.tournament.platform} · {formatDateTime(data.tournament.date)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-5">
          <p
            className="font-data font-semibold leading-none"
            style={{ fontSize: "60px", color: "var(--pk-deep-dim)", letterSpacing: "-0.02em" }}
          >
            —
          </p>
          <p className="font-data text-[11px] mt-4" style={{ color: "var(--pk-text-hint)" }}>
            Nenhum torneio registrado ainda
          </p>
        </div>
      )}
    </Card>
  );
}

function MostTournamentsCompact({ data }: { data: StatsMostTournamentsInADay | null }) {
  return (
    <Card className="glass-panel border-0 bg-transparent shadow-none text-text-primary flex-1 py-5 px-6">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">Mais torneios em um dia</p>
        <span
          className="font-data text-[9px] tracking-[0.22em]"
          style={{ color: "var(--primary)" }}
        >
          ◆ VOLUME
        </span>
      </div>
      {data ? (
        <div className="mt-3 flex items-baseline gap-3">
          <p
            className="font-data font-semibold leading-none"
            style={{ fontSize: "34px", color: "var(--foreground)" }}
          >
            {data.count}
          </p>
          <div>
            <span
              className="font-data text-[10px] uppercase tracking-[0.15em] block"
              style={{ color: "var(--muted-foreground)" }}
            >
              torneios
            </span>
            <span
              className="font-data text-[11px] block mt-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              {formatDayFull(data.date)}
            </span>
          </div>
        </div>
      ) : (
        <p
          className="font-data font-semibold leading-none mt-3"
          style={{ fontSize: "34px", color: "var(--pk-deep-dim)" }}
        >
          —
        </p>
      )}
    </Card>
  );
}

function HighestAbiCompact({ data }: { data: StatsHighestAbiDay | null }) {
  return (
    <Card className="glass-panel border-0 bg-transparent shadow-none text-text-primary flex-1 py-5 px-6">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">Maior ABI em um dia</p>
        <span
          className="font-data text-[9px] tracking-[0.22em]"
          style={{ color: "var(--primary)" }}
        >
          ◆ ALTITUDE
        </span>
      </div>
      {data ? (
        <div className="mt-3 flex items-baseline gap-3">
          <p
            className="font-data font-semibold leading-none"
            style={{ fontSize: "34px", color: "var(--foreground)" }}
          >
            $ {data.abi.toFixed(2)}
          </p>
          <div>
            <span
              className="font-data text-[10px] uppercase tracking-[0.15em] block"
              style={{ color: "var(--muted-foreground)" }}
            >
              ABI
            </span>
            <span
              className="font-data text-[11px] block mt-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              {formatDayFull(data.date)} · {data.tournaments}t
            </span>
          </div>
        </div>
      ) : (
        <p
          className="font-data font-semibold leading-none mt-3"
          style={{ fontSize: "34px", color: "var(--pk-deep-dim)" }}
        >
          —
        </p>
      )}
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Section 02+03 — Period Comparison Matrix
 * ────────────────────────────────────────────────────────────────────────*/

const PERIOD_HEADERS = ["DIA", "SEMANA", "MÊS", "ANO"];

function PeriodMatrix({
  profitBuckets,
  lossBuckets,
}: {
  profitBuckets: BucketCardData[];
  lossBuckets: BucketCardData[];
}) {
  const CELL_BORDER = "1px solid rgba(212,168,67,0.07)";

  return (
    <section>
      <SectionLabel index="02 — 03" title="Recordes por período" />
      <div className="glass-panel overflow-x-auto">
        <div style={{ minWidth: "480px" }}>
          {/* Column headers */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "64px 1fr 1fr 1fr 1fr",
              borderBottom: "1px solid rgba(212,168,67,0.12)",
            }}
          >
            <div className="px-5 py-3" />
            {PERIOD_HEADERS.map((h) => (
              <div key={h} className="px-5 py-3" style={{ borderLeft: CELL_BORDER }}>
                <span
                  className="font-data text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* Profit row */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "64px 1fr 1fr 1fr 1fr",
              borderBottom: "1px solid rgba(212,168,67,0.06)",
            }}
          >
            <div className="px-5 py-5 flex items-center">
              <span
                className="font-data text-[10px] tracking-[0.1em]"
                style={{ color: "var(--pk-success)" }}
              >
                ▲ MAX
              </span>
            </div>
            {profitBuckets.map((bucket) => (
              <div key={bucket.range} className="px-5 py-5" style={{ borderLeft: CELL_BORDER }}>
                {bucket.record ? (
                  <>
                    <p
                      className="font-data font-semibold leading-none"
                      style={{ fontSize: "15px", color: "var(--pk-success)" }}
                    >
                      {formatCurrency(bucket.record.amount)}
                    </p>
                    <p
                      className="font-data text-[10px] mt-2 leading-tight"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {formatBucketPeriod(bucket)}
                    </p>
                  </>
                ) : (
                  <p
                    className="font-data font-semibold leading-none"
                    style={{ fontSize: "15px", color: "var(--pk-deep-dim)" }}
                  >
                    —
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Loss row */}
          <div
            className="grid"
            style={{ gridTemplateColumns: "64px 1fr 1fr 1fr 1fr" }}
          >
            <div className="px-5 py-5 flex items-center">
              <span
                className="font-data text-[10px] tracking-[0.1em]"
                style={{ color: "var(--destructive)" }}
              >
                ▼ MIN
              </span>
            </div>
            {lossBuckets.map((bucket) => (
              <div key={bucket.range} className="px-5 py-5" style={{ borderLeft: CELL_BORDER }}>
                {bucket.record ? (
                  <>
                    <p
                      className="font-data font-semibold leading-none"
                      style={{ fontSize: "15px", color: "var(--destructive)" }}
                    >
                      {formatCurrency(bucket.record.amount)}
                    </p>
                    <p
                      className="font-data text-[10px] mt-2 leading-tight"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {formatBucketPeriod(bucket)}
                    </p>
                  </>
                ) : (
                  <p
                    className="font-data font-semibold leading-none"
                    style={{ fontSize: "15px", color: "var(--pk-deep-dim)" }}
                  >
                    —
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Section 04 — Platform Bar Chart
 * ────────────────────────────────────────────────────────────────────────*/

function PlatformBars({ platforms }: { platforms: StatsPlatformEntry[] }) {
  if (!platforms.length) return null;

  const maxAbs = Math.max(...platforms.map((p) => Math.abs(p.profit)), 1);

  return (
    <section>
      <SectionLabel index="04" title="Plataformas" />
      <div className="glass-panel overflow-hidden">
        {platforms.map((p, i) => {
          const pct = (Math.abs(p.profit) / maxAbs) * 100;
          const isPositive = p.profit >= 0;
          const accentColor = isPositive ? "var(--pk-success)" : "var(--destructive)";
          const barHex = isPositive ? "var(--pk-success)" : "var(--destructive)";
          const isLast = i === platforms.length - 1;

          return (
            <div
              key={p.platform}
              className="group transition-colors duration-150"
              style={{
                borderBottom: isLast
                  ? "none"
                  : "1px solid rgba(212,168,67,0.07)",
              }}
            >
              <div
                className="px-6 py-4 flex items-center gap-4"
                style={{ transition: "background 0.15s ease" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(212,168,67,0.025)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "")
                }
              >
                <span
                  className="font-data text-[10px] shrink-0 w-5 text-right"
                  style={{ color: "var(--pk-dim)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="font-display text-sm font-semibold shrink-0"
                  style={{ color: "var(--foreground)", minWidth: "100px" }}
                >
                  {p.platform}
                </span>
                <div
                  className="flex-1 rounded-none overflow-hidden"
                  style={{ height: "4px", background: "rgba(255,255,255,0.04)" }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: barHex,
                      opacity: 0.65,
                      transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>
                <span
                  className="font-data text-sm font-semibold shrink-0 text-right"
                  style={{ color: accentColor, minWidth: "96px" }}
                >
                  {formatCurrency(p.profit)}
                </span>
                <span
                  className="font-data text-[11px] shrink-0 text-right"
                  style={{ color: "var(--muted-foreground)", minWidth: "44px" }}
                >
                  {p.count}t
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Section 05 — Podium
 * ────────────────────────────────────────────────────────────────────────*/

const PODIUM_CONFIG = [
  {
    key: "silver" as const,
    emoji: "🥈",
    label: "2º Lugar",
    color: "#9BA3AF",
    border: "rgba(155,163,175,0.20)",
    bg: "rgba(155,163,175,0.04)",
    offset: "40px",
  },
  {
    key: "gold" as const,
    emoji: "🥇",
    label: "1º Lugar",
    color: "var(--primary)",
    border: "rgba(212,168,67,0.35)",
    bg: "rgba(212,168,67,0.05)",
    offset: "0px",
  },
  {
    key: "bronze" as const,
    emoji: "🥉",
    label: "3º Lugar",
    color: "#CD7F32",
    border: "rgba(205,127,50,0.20)",
    bg: "rgba(205,127,50,0.04)",
    offset: "72px",
  },
] as const;

function PodiumItem({ t, accentColor }: { t: Tournament; accentColor: string }) {
  const profit = getTournamentProfitNative(t);
  const isPos = profit >= 0;
  const profitColor = isPos ? "var(--pk-success)" : "var(--destructive)";

  return (
    <div
      className="px-5 py-3.5 flex flex-col gap-1"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <p
        className="font-display text-sm font-semibold leading-tight truncate"
        style={{ color: "var(--foreground)" }}
      >
        {t.name}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-data text-[11px] truncate"
          style={{ color: "var(--muted-foreground)" }}
        >
          {t.platform} · {formatDayFull(t.date)}
        </span>
        <span
          className="font-data text-[12px] font-semibold shrink-0"
          style={{ color: profitColor }}
        >
          {profit >= 0 ? "+" : ""}
          {formatCurrency(profit)}
        </span>
      </div>
    </div>
  );
}

function PodiumColumn({
  emoji,
  label,
  color,
  border,
  bg,
  offset,
  tournaments,
}: {
  emoji: string;
  label: string;
  color: string;
  border: string;
  bg: string;
  offset: string;
  tournaments: Tournament[];
}) {
  const count = tournaments.length;

  return (
    <div className="flex flex-col" style={{ marginTop: offset }}>
      <div
        className="overflow-hidden rounded-2xl flex flex-col"
        style={{ border: `1px solid ${border}` }}
      >
        {/* Column header */}
        <div
          className="px-5 py-5 flex flex-col items-center gap-2 text-center"
          style={{
            background: bg,
            borderBottom: `1px solid ${border}`,
          }}
        >
          <span style={{ fontSize: "32px", lineHeight: 1 }}>{emoji}</span>
          <div>
            <p
              className="font-data text-[10px] uppercase tracking-[0.22em] font-semibold"
              style={{ color }}
            >
              {label}
            </p>
            <p
              className="font-data text-[11px] mt-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              {count} torneio{count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Tournament list */}
        {count === 0 ? (
          <div
            className="flex items-center justify-center py-10 px-5"
            style={{ background: "rgba(255,255,255,0.01)" }}
          >
            <p
              className="font-data text-[11px] uppercase tracking-[0.15em] text-center"
              style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
            >
              Sem registros
            </p>
          </div>
        ) : (
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: "300px",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            {tournaments.map((t) => (
              <PodiumItem key={t.id ?? `${t.date}-${t.name}`} t={t} accentColor={color} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumSection({ podium }: { podium: PodiumByPosition }) {
  const total = podium.gold.length + podium.silver.length + podium.bronze.length;

  return (
    <section>
      <SectionLabel index="05" title="Pódios" />
      {total === 0 ? (
        <div
          className="glass-panel flex items-center justify-center py-12"
          style={{ borderStyle: "dashed" }}
        >
          <p
            className="font-data text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
          >
            Nenhum pódio registrado ainda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {PODIUM_CONFIG.map((cfg) => (
            <PodiumColumn
              key={cfg.key}
              emoji={cfg.emoji}
              label={cfg.label}
              color={cfg.color}
              border={cfg.border}
              bg={cfg.bg}
              offset={cfg.offset}
              tournaments={podium[cfg.key]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Main view
 * ────────────────────────────────────────────────────────────────────────*/

export function StatsView() {
  const {
    isLoading,
    isError,
    hasData,
    biggestBuyIn,
    mostTournamentsInADay,
    highestAbiDay,
    profitBuckets,
    lossBuckets,
    allPlatforms,
    totalTournaments,
    itmRate,
    ftRate,
    podiumByPosition,
  } = useStatsViewModel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-data text-sm tracking-[0.1em] uppercase text-text-secondary animate-pulse">
          Carregando estatísticas…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p
          className="font-data text-sm tracking-[0.1em] uppercase"
          style={{ color: "var(--destructive)" }}
        >
          Erro ao carregar estatísticas
        </p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-data text-sm tracking-[0.1em] uppercase text-text-secondary">
          Sem dados suficientes para exibir estatísticas
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[90%] mx-auto mt-10 gap-12 pb-16">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={revealed(0)}>
        <header
          className="flex items-end justify-between pb-6"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Estatísticas
            </p>
            <h1
              className="font-display text-3xl font-bold text-text-primary leading-none"
              style={{ letterSpacing: "0.02em" }}
            >
              Seus recordes
            </h1>
          </div>
          <p
            className="font-data text-[11px] uppercase tracking-[0.2em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            Hall of fame
          </p>
        </header>

        {totalTournaments > 0 && (
          <StatStrip
            totalTournaments={totalTournaments}
            itmRate={itmRate}
            ftRate={ftRate}
            platformCount={allPlatforms.length}
          />
        )}
      </div>

      {/* ── 01 — Records Hero ───────────────────────────────────────────── */}
      <div style={revealed(80)}>
        <SectionLabel index="01" title="Recordes pessoais" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <BiggestBuyInHero data={biggestBuyIn} />
          </div>
          <div className="flex flex-col gap-4">
            <MostTournamentsCompact data={mostTournamentsInADay} />
            <HighestAbiCompact data={highestAbiDay} />
          </div>
        </div>
      </div>

      {/* ── 02+03 — Period Matrix ────────────────────────────────────────── */}
      <div style={revealed(160)}>
        <PeriodMatrix profitBuckets={profitBuckets} lossBuckets={lossBuckets} />
      </div>

      {/* ── 04 — Platform Bars ──────────────────────────────────────────── */}
      {allPlatforms.length > 0 && (
        <div style={revealed(240)}>
          <PlatformBars platforms={allPlatforms} />
        </div>
      )}

      {/* ── 05 — Podium ─────────────────────────────────────────────────── */}
      <div style={revealed(320)}>
        <PodiumSection podium={podiumByPosition} />
      </div>
    </div>
  );
}
