"use client";

import { Card } from "@/components/ui/card";
import type {
  StatsBiggestBuyIn,
  StatsHighestAbiDay,
  StatsMostTournamentsInADay,
} from "@/services/hooks/types";
import type { BucketCardData, StatsPlatformEntry, StatsPlatformStats } from "./stats.types";
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
  return `${dd1}/${mm1} — ${dd2}/${mm2}`;
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
    case "day":
      return formatDayFull(data.record.bucketStart);
    case "week":
      return formatWeek(data.record.bucketStart);
    case "month":
      return formatMonth(data.record.bucketStart);
    case "year":
      return formatYear(data.record.bucketStart);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Sub-components
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

function EmptyValue() {
  return (
    <p
      className="font-data text-2xl font-semibold leading-none"
      style={{ color: "#3a342d" }}
    >
      —
    </p>
  );
}

function BiggestBuyInCard({ data }: { data: StatsBiggestBuyIn | null }) {
  return (
    <Card className="glass-panel w-full border-0 bg-transparent py-6 px-6 shadow-none text-text-primary flex flex-col justify-between min-h-[180px]">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">Maior buy-in</p>
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
            className="font-data font-semibold leading-none mt-3"
            style={{ fontSize: "34px", color: "#f0ede8" }}
          >
            $ {data.value.toFixed(2)}
          </p>
          <div className="mt-4 flex flex-col gap-1">
            <p
              className="font-display text-sm font-semibold leading-tight"
              style={{ color: "#f0ede8" }}
            >
              {data.tournament.name}
            </p>
            <p className="font-data text-[11px]" style={{ color: "#7a7068" }}>
              {data.tournament.platform} · {formatDateTime(data.tournament.date)}
            </p>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <EmptyValue />
          <p className="font-data text-[11px] mt-3" style={{ color: "#7a7068" }}>
            Nenhum torneio registrado ainda
          </p>
        </div>
      )}
    </Card>
  );
}

function MostTournamentsCard({
  data,
}: {
  data: StatsMostTournamentsInADay | null;
}) {
  return (
    <Card className="glass-panel w-full border-0 bg-transparent py-6 px-6 shadow-none text-text-primary flex flex-col justify-between min-h-[180px]">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">Mais torneios em um dia</p>
        <span
          className="font-data text-[9px] tracking-[0.22em]"
          style={{ color: "#d4a843" }}
        >
          ◆ VOLUME
        </span>
      </div>

      {data ? (
        <>
          <div className="flex items-baseline gap-2 mt-3">
            <p
              className="font-data font-semibold leading-none"
              style={{ fontSize: "34px", color: "#f0ede8" }}
            >
              {data.count}
            </p>
            <span
              className="font-data text-[11px] uppercase tracking-[0.18em]"
              style={{ color: "#7a7068" }}
            >
              torneios
            </span>
          </div>
          <div className="mt-4">
            <p
              className="font-data text-[11px] uppercase tracking-[0.18em]"
              style={{ color: "#7a7068" }}
            >
              Em
            </p>
            <p className="font-data text-sm mt-1" style={{ color: "#f0ede8" }}>
              {formatDayFull(data.date)}
            </p>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <EmptyValue />
          <p className="font-data text-[11px] mt-3" style={{ color: "#7a7068" }}>
            Sem histórico de volume
          </p>
        </div>
      )}
    </Card>
  );
}

function HighestAbiCard({ data }: { data: StatsHighestAbiDay | null }) {
  return (
    <Card className="glass-panel w-full border-0 bg-transparent py-6 px-6 shadow-none text-text-primary flex flex-col justify-between min-h-[180px]">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">Maior ABI em um dia</p>
        <span
          className="font-data text-[9px] tracking-[0.22em]"
          style={{ color: "#d4a843" }}
        >
          ◆ ALTITUDE
        </span>
      </div>

      {data ? (
        <>
          <div className="flex items-baseline gap-2 mt-3">
            <p
              className="font-data font-semibold leading-none"
              style={{ fontSize: "34px", color: "#f0ede8" }}
            >
              $ {data.abi.toFixed(2)}
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p
                className="font-data text-[10px] uppercase tracking-[0.18em]"
                style={{ color: "#7a7068" }}
              >
                Data
              </p>
              <p
                className="font-data text-sm mt-1"
                style={{ color: "#f0ede8" }}
              >
                {formatDayFull(data.date)}
              </p>
            </div>
            <div>
              <p
                className="font-data text-[10px] uppercase tracking-[0.18em]"
                style={{ color: "#7a7068" }}
              >
                Torneios
              </p>
              <p
                className="font-data text-sm mt-1"
                style={{ color: "#f0ede8" }}
              >
                {data.tournaments}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <EmptyValue />
          <p className="font-data text-[11px] mt-3" style={{ color: "#7a7068" }}>
            Sem sessões registradas
          </p>
        </div>
      )}
    </Card>
  );
}

function BucketCard({
  data,
  tone,
}: {
  data: BucketCardData;
  tone: "profit" | "loss";
}) {
  const record = data.record;
  const hasValue = record !== null;
  const accent = tone === "profit" ? "#3db87a" : "#c44040";
  const glyph = tone === "profit" ? "▲" : "▼";

  return (
    <Card className="glass-inner w-full border-0 bg-transparent py-4 px-4 shadow-none text-text-primary">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">{data.label}</p>
        {hasValue && (
          <span
            className="font-data text-[10px] leading-none"
            style={{ color: accent }}
            aria-hidden="true"
          >
            {glyph}
          </span>
        )}
      </div>

      {hasValue ? (
        <>
          <p
            className="font-data leading-none mt-2"
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: accent,
            }}
          >
            {formatCurrency(record.amount)}
          </p>
          <p
            className="font-data text-[11px] mt-3"
            style={{ color: "#7a7068" }}
          >
            {formatBucketPeriod(data)}
          </p>
        </>
      ) : (
        <>
          <p
            className="font-data leading-none mt-2"
            style={{ fontSize: "20px", fontWeight: 600, color: "#3a342d" }}
          >
            —
          </p>
          <p
            className="font-data text-[11px] mt-3"
            style={{ color: "#4a433c" }}
          >
            Sem registro
          </p>
        </>
      )}
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Main view
 * ────────────────────────────────────────────────────────────────────────*/

function PlatformCard({
  label,
  badge,
  entry,
  valueType,
}: {
  label: string;
  badge: string;
  entry: StatsPlatformEntry | null;
  valueType: "profit" | "loss" | "count-most" | "count-least";
}) {
  const accentColor =
    valueType === "profit"
      ? "#3db87a"
      : valueType === "loss"
        ? "#c44040"
        : "#d4a843";

  return (
    <Card className="glass-panel w-full border-0 bg-transparent py-6 px-6 shadow-none text-text-primary flex flex-col justify-between min-h-[160px]">
      <div className="flex items-center justify-between">
        <p className="activity-card-title">{label}</p>
        <span
          className="font-data text-[9px] tracking-[0.22em]"
          style={{ color: accentColor }}
        >
          {badge}
        </span>
      </div>

      {entry ? (
        <>
          <p
            className="font-data font-semibold leading-none mt-3"
            style={{ fontSize: "26px", color: "#f0ede8" }}
          >
            {entry.platform}
          </p>
          <div className="mt-3 flex items-baseline gap-4">
            {(valueType === "profit" || valueType === "loss") && (
              <span
                className="font-data text-sm font-semibold"
                style={{ color: accentColor }}
              >
                {formatCurrency(entry.profit)}
              </span>
            )}
            <span className="font-data text-[11px]" style={{ color: "#7a7068" }}>
              {entry.count} {entry.count === 1 ? "torneio" : "torneios"}
            </span>
            {(valueType === "count-most" || valueType === "count-least") && (
              <span
                className="font-data text-sm font-semibold"
                style={{ color: entry.profit >= 0 ? "#3db87a" : "#c44040" }}
              >
                {formatCurrency(entry.profit)}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="mt-3">
          <EmptyValue />
          <p className="font-data text-[11px] mt-3" style={{ color: "#7a7068" }}>
            Sem dados de plataforma
          </p>
        </div>
      )}
    </Card>
  );
}

function PlatformStatsSection({ stats }: { stats: StatsPlatformStats | null }) {
  if (!stats) return null;

  return (
    <section>
      <SectionLabel index="04" title="Ranking de plataformas" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <PlatformCard
          label="Maior lucro"
          badge="◆ LUCRO"
          entry={stats.mostProfit}
          valueType="profit"
        />
        <PlatformCard
          label="Maior perda"
          badge="◆ PERDA"
          entry={stats.mostLoss}
          valueType="loss"
        />
        <PlatformCard
          label="Mais torneios"
          badge="◆ VOLUME"
          entry={stats.mostTournaments}
          valueType="count-most"
        />
        <PlatformCard
          label="Menos torneios"
          badge="◆ MENOR"
          entry={stats.leastTournaments}
          valueType="count-least"
        />
      </div>
    </section>
  );
}

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
    platformStats,
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

      <section>
        <SectionLabel index="01" title="Recordes pessoais" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BiggestBuyInCard data={biggestBuyIn} />
          <MostTournamentsCard data={mostTournamentsInADay} />
          <HighestAbiCard data={highestAbiDay} />
        </div>
      </section>

      <section>
        <SectionLabel index="02" title="Maior lucro por período" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profitBuckets.map((bucket) => (
            <BucketCard
              key={`profit-${bucket.range}`}
              data={bucket}
              tone="profit"
            />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel index="03" title="Maior perda por período" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lossBuckets.map((bucket) => (
            <BucketCard
              key={`loss-${bucket.range}`}
              data={bucket}
              tone="loss"
            />
          ))}
        </div>
      </section>

      <PlatformStatsSection stats={platformStats} />
    </div>
  );
}
