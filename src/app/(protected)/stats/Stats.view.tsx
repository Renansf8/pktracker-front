"use client";

import { Card } from "@/components/ui/card";
import type {
  StatsBiggestBuyIn,
  StatsHighestAbiDay,
  StatsMostTournamentsInADay,
} from "@/services/hooks/types";
import type { BucketCardData, StatsPlatformEntry } from "./stats.types";
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
        style={{ color: "#d4a843" }}
      >
        {index}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.18em] font-medium"
        style={{ color: "#7a7068" }}
      >
        {title}
      </span>
      <span
        className="flex-1 h-px"
        style={{ background: "rgba(212,168,67,0.14)" }}
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
        borderTop: "1px solid rgba(212,168,67,0.1)",
        borderBottom: "1px solid rgba(212,168,67,0.1)",
      }}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <span
            className="font-data text-lg font-semibold leading-none"
            style={{ color: "#f0ede8" }}
          >
            {item.value}
          </span>
          <span
            className="font-data text-[9px] uppercase tracking-[0.22em]"
            style={{ color: "#7a7068" }}
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
          style={{ color: "#d4a843" }}
        >
          ◆ RECORDE
        </span>
      </div>

      {data ? (
        <>
          <p
            className="font-data font-semibold leading-none mt-5"
            style={{ fontSize: "clamp(40px,6vw,60px)", color: "#f0ede8", letterSpacing: "-0.02em" }}
          >
            ${" "}{data.value.toFixed(2)}
          </p>
          <div
            className="mt-auto pt-5 flex items-end justify-between"
            style={{ borderTop: "1px solid rgba(212,168,67,0.1)" }}
          >
            <div>
              <p
                className="font-display text-sm font-semibold leading-tight"
                style={{ color: "#f0ede8" }}
              >
                {data.tournament.name}
              </p>
              <p className="font-data text-[11px] mt-1.5" style={{ color: "#7a7068" }}>
                {data.tournament.platform} · {formatDateTime(data.tournament.date)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-5">
          <p
            className="font-data font-semibold leading-none"
            style={{ fontSize: "60px", color: "#1e1a16", letterSpacing: "-0.02em" }}
          >
            —
          </p>
          <p className="font-data text-[11px] mt-4" style={{ color: "#4a433c" }}>
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
        <span className="font-data text-[9px] tracking-[0.22em]" style={{ color: "#d4a843" }}>
          ◆ VOLUME
        </span>
      </div>
      {data ? (
        <div className="mt-3 flex items-baseline gap-3">
          <p
            className="font-data font-semibold leading-none"
            style={{ fontSize: "34px", color: "#f0ede8" }}
          >
            {data.count}
          </p>
          <div>
            <span
              className="font-data text-[10px] uppercase tracking-[0.15em] block"
              style={{ color: "#7a7068" }}
            >
              torneios
            </span>
            <span
              className="font-data text-[11px] block mt-0.5"
              style={{ color: "#7a7068" }}
            >
              {formatDayFull(data.date)}
            </span>
          </div>
        </div>
      ) : (
        <p
          className="font-data font-semibold leading-none mt-3"
          style={{ fontSize: "34px", color: "#1e1a16" }}
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
        <span className="font-data text-[9px] tracking-[0.22em]" style={{ color: "#d4a843" }}>
          ◆ ALTITUDE
        </span>
      </div>
      {data ? (
        <div className="mt-3 flex items-baseline gap-3">
          <p
            className="font-data font-semibold leading-none"
            style={{ fontSize: "34px", color: "#f0ede8" }}
          >
            $ {data.abi.toFixed(2)}
          </p>
          <div>
            <span
              className="font-data text-[10px] uppercase tracking-[0.15em] block"
              style={{ color: "#7a7068" }}
            >
              ABI
            </span>
            <span
              className="font-data text-[11px] block mt-0.5"
              style={{ color: "#7a7068" }}
            >
              {formatDayFull(data.date)} · {data.tournaments}t
            </span>
          </div>
        </div>
      ) : (
        <p
          className="font-data font-semibold leading-none mt-3"
          style={{ fontSize: "34px", color: "#1e1a16" }}
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
              <div
                key={h}
                className="px-5 py-3"
                style={{ borderLeft: CELL_BORDER }}
              >
                <span
                  className="font-data text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: "#5a5248" }}
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
                style={{ color: "#3db87a" }}
              >
                ▲ MAX
              </span>
            </div>
            {profitBuckets.map((bucket) => (
              <div
                key={bucket.range}
                className="px-5 py-5"
                style={{ borderLeft: CELL_BORDER }}
              >
                {bucket.record ? (
                  <>
                    <p
                      className="font-data font-semibold leading-none"
                      style={{ fontSize: "15px", color: "#3db87a" }}
                    >
                      {formatCurrency(bucket.record.amount)}
                    </p>
                    <p
                      className="font-data text-[10px] mt-2 leading-tight"
                      style={{ color: "#5a5248" }}
                    >
                      {formatBucketPeriod(bucket)}
                    </p>
                  </>
                ) : (
                  <p
                    className="font-data font-semibold leading-none"
                    style={{ fontSize: "15px", color: "#1e1a16" }}
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
                style={{ color: "#c44040" }}
              >
                ▼ MIN
              </span>
            </div>
            {lossBuckets.map((bucket) => (
              <div
                key={bucket.range}
                className="px-5 py-5"
                style={{ borderLeft: CELL_BORDER }}
              >
                {bucket.record ? (
                  <>
                    <p
                      className="font-data font-semibold leading-none"
                      style={{ fontSize: "15px", color: "#c44040" }}
                    >
                      {formatCurrency(bucket.record.amount)}
                    </p>
                    <p
                      className="font-data text-[10px] mt-2 leading-tight"
                      style={{ color: "#5a5248" }}
                    >
                      {formatBucketPeriod(bucket)}
                    </p>
                  </>
                ) : (
                  <p
                    className="font-data font-semibold leading-none"
                    style={{ fontSize: "15px", color: "#1e1a16" }}
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
          const accentColor = isPositive ? "#3db87a" : "#c44040";
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
                className="px-6 py-4 flex items-center gap-4 group-hover:bg-[rgba(212,168,67,0.025)]"
                style={{ transition: "background 0.15s ease" }}
              >
                {/* Rank */}
                <span
                  className="font-data text-[10px] shrink-0 w-5 text-right"
                  style={{ color: "#2e2822" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Platform name */}
                <span
                  className="font-display text-sm font-semibold shrink-0"
                  style={{ color: "#f0ede8", minWidth: "100px" }}
                >
                  {p.platform}
                </span>

                {/* Proportional bar */}
                <div
                  className="flex-1 rounded-none overflow-hidden"
                  style={{
                    height: "4px",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: accentColor,
                      opacity: 0.65,
                      transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>

                {/* Amount */}
                <span
                  className="font-data text-sm font-semibold shrink-0 text-right"
                  style={{ color: accentColor, minWidth: "96px" }}
                >
                  {formatCurrency(p.profit)}
                </span>

                {/* Count */}
                <span
                  className="font-data text-[11px] shrink-0 text-right"
                  style={{ color: "#7a7068", minWidth: "44px" }}
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
          style={{ color: "#c44040" }}
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
          style={{ borderBottom: "1px solid rgba(212,168,67,0.14)" }}
        >
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
              style={{ color: "#7a7068" }}
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
            style={{ color: "#7a7068" }}
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
    </div>
  );
}
