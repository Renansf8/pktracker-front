"use client";

import { useCareerViewModel } from "./career.viewmodel";
import type { Milestone, StakesProgression, StakingDeal, NewDealState } from "./career.types";

/* ── Constants ────────────────────────────────────────────────────────────── */

const GOLD = "#d4a843";
const MUTED = "#7a7068";
const SUCCESS = "#3db87a";
const DANGER = "#c44040";

const fmtUsd = (v: number) =>
  `$ ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

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

/* ── Section 01 — Stakes Progression ─────────────────────────────────────── */

function StakesProgressionSection({
  prog,
  totalTournaments,
}: {
  prog: StakesProgression;
  totalTournaments: number;
}) {
  return (
    <section>
      <SectionLabel index="01" title="Progressão de stakes" />
      <div className="glass-panel py-7 px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Nível atual */}
          <div>
            <p className="font-data text-[9px] uppercase tracking-[0.22em] mb-3" style={{ color: GOLD }}>
              ◆ NÍVEL ATUAL
            </p>
            <p
              className="font-data font-semibold leading-none"
              style={{ fontSize: "clamp(40px,5vw,56px)", color: "var(--foreground)" }}
            >
              $ {prog.currentStake.toFixed(prog.currentStake % 1 === 0 ? 0 : 1)}
            </p>
            <p className="font-data text-[11px] mt-2" style={{ color: MUTED }}>
              {prog.customBuyIns !== null
                ? `Regra: ${Math.round(prog.customBuyIns)} buy-ins`
                : "Regra: 100 a 150 buy-ins"}
            </p>
            <p className="font-data text-[11px] mt-1" style={{ color: MUTED }}>
              ABI sugerida:{" "}
              {prog.rangeMin === prog.rangeMax
                ? fmtUsd(prog.rangeMin)
                : `${fmtUsd(prog.rangeMin)} — ${fmtUsd(prog.rangeMax)}`}
            </p>
          </div>

          {/* Próximo nível */}
          <div>
            <p className="font-data text-[9px] uppercase tracking-[0.22em] mb-3" style={{ color: MUTED }}>
              ◇ PRÓXIMO NÍVEL
            </p>
            {prog.nextStake ? (
              <>
                <p
                  className="font-data font-semibold leading-none"
                  style={{ fontSize: "clamp(40px,5vw,56px)", color: MUTED }}
                >
                  $ {prog.nextStake.toFixed(prog.nextStake % 1 === 0 ? 0 : 1)}
                </p>
                <p className="font-data text-[11px] mt-3" style={{ color: MUTED }}>
                  Banca necessária: {fmtUsd(prog.bankNeededForNext ?? 0)}
                </p>
              </>
            ) : (
              <p
                className="font-data font-semibold leading-none"
                style={{ fontSize: "clamp(40px,5vw,56px)", color: MUTED }}
              >
                —
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-data text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: MUTED }}>
                Banca atual
              </p>
              <p className="font-data text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                {fmtUsd(prog.bankUsd)}
              </p>
            </div>
            <div>
              <p className="font-data text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: MUTED }}>
                Torneios registrados
              </p>
              <p className="font-data text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                {totalTournaments}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {prog.nextStake && (
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="font-data text-[10px]" style={{ color: MUTED }}>
                $ {prog.currentStake.toFixed(prog.currentStake % 1 === 0 ? 0 : 1)}
              </span>
              <span className="font-data text-[10px]" style={{ color: MUTED }}>
                {prog.progressToNext.toFixed(1)}% para $ {prog.nextStake.toFixed(prog.nextStake % 1 === 0 ? 0 : 1)}
              </span>
            </div>
            <div
              className="w-full h-1 rounded-none overflow-hidden"
              style={{ background: "rgba(212,168,67,0.1)" }}
            >
              <div
                style={{
                  width: `${prog.progressToNext}%`,
                  height: "100%",
                  background: GOLD,
                  transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Section 02 — Milestones timeline ────────────────────────────────────── */

function MilestonesTimeline({ milestones }: { milestones: Milestone[] }) {
  if (!milestones.length) return null;

  return (
    <section>
      <SectionLabel index="02" title="Marcos da carreira" />
      <div className="glass-panel overflow-hidden">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          return (
            <div
              key={m.id}
              className="flex items-center gap-5 px-6 py-4"
              style={{
                borderBottom: isLast ? "none" : "1px solid rgba(212,168,67,0.07)",
              }}
            >
              <span
                className="font-data text-sm shrink-0 w-5 text-center"
                style={{ color: GOLD }}
              >
                {m.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-display text-sm font-semibold truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {m.label}
                </p>
                <p
                  className="font-data text-[11px] truncate mt-0.5"
                  style={{ color: MUTED }}
                >
                  {m.sublabel}
                </p>
              </div>
              {m.value !== undefined && (
                <span
                  className="font-data text-sm font-semibold shrink-0"
                  style={{ color: SUCCESS }}
                >
                  {fmtUsd(m.value)}
                </span>
              )}
              <span
                className="font-data text-[11px] shrink-0 text-right"
                style={{ color: MUTED, minWidth: "80px" }}
              >
                {fmtDate(m.date)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Section 03 — Staking tracker ────────────────────────────────────────── */

function StakingTracker({
  deals,
  newDeal,
  onChange,
  onAdd,
  onRemove,
}: {
  deals: StakingDeal[];
  newDeal: NewDealState;
  onChange: (field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    background: "rgba(212,168,67,0.05)",
    border: "1px solid rgba(212,168,67,0.14)",
    borderRadius: "2px",
    color: "var(--foreground)",
    padding: "6px 10px",
    fontSize: "12px",
    fontFamily: "var(--font-jetbrains), monospace",
    outline: "none",
    width: "100%",
  };

  return (
    <section>
      <SectionLabel index="03" title="Staking" />

      {/* Existing deals */}
      {deals.length > 0 && (
        <div className="glass-panel overflow-hidden mb-4">
          {deals.map((deal, i) => {
            const isLast = i === deals.length - 1;
            return (
              <div
                key={deal.id}
                className="flex items-center gap-5 px-6 py-4"
                style={{
                  borderBottom: isLast ? "none" : "1px solid rgba(212,168,67,0.07)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="font-display text-sm font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {deal.backerName}
                  </p>
                  {deal.notes && (
                    <p className="font-data text-[11px] mt-0.5 truncate" style={{ color: MUTED }}>
                      {deal.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="font-data text-[9px] uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                      Minha parte
                    </p>
                    <p className="font-data text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {deal.myPct}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-data text-[9px] uppercase tracking-[0.15em]" style={{ color: MUTED }}>
                      Markup
                    </p>
                    <p className="font-data text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {deal.markup.toFixed(2)}x
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(deal.id)}
                    className="font-data text-[11px] uppercase tracking-[0.1em] transition-colors duration-150"
                    style={{ color: MUTED }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = DANGER)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = MUTED)
                    }
                  >
                    remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new deal */}
      <div className="glass-panel py-5 px-6">
        <p
          className="font-data text-[10px] uppercase tracking-[0.2em] mb-4"
          style={{ color: MUTED }}
        >
          Novo acordo
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="sm:col-span-2">
            <label className="font-data text-[9px] uppercase tracking-[0.15em] block mb-1" style={{ color: MUTED }}>
              Backer
            </label>
            <input
              style={inputStyle}
              placeholder="Nome do backer"
              value={newDeal.backerName}
              onChange={(e) => onChange("backerName", e.target.value)}
            />
          </div>
          <div>
            <label className="font-data text-[9px] uppercase tracking-[0.15em] block mb-1" style={{ color: MUTED }}>
              Minha %
            </label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={100}
              placeholder="50"
              value={newDeal.myPct}
              onChange={(e) => onChange("myPct", e.target.value)}
            />
          </div>
          <div>
            <label className="font-data text-[9px] uppercase tracking-[0.15em] block mb-1" style={{ color: MUTED }}>
              Markup
            </label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              step={0.05}
              placeholder="1.00"
              value={newDeal.markup}
              onChange={(e) => onChange("markup", e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="font-data text-[9px] uppercase tracking-[0.15em] block mb-1" style={{ color: MUTED }}>
            Notas
          </label>
          <input
            style={inputStyle}
            placeholder="Observações (opcional)"
            value={newDeal.notes}
            onChange={(e) => onChange("notes", e.target.value)}
          />
        </div>
        <button
          onClick={onAdd}
          className="font-data text-[11px] uppercase tracking-[0.15em] transition-colors duration-150 px-5 py-2"
          style={{
            border: "1px solid rgba(212,168,67,0.3)",
            borderRadius: "2px",
            color: GOLD,
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(212,168,67,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          Adicionar
        </button>
      </div>
    </section>
  );
}

/* ── Main view ────────────────────────────────────────────────────────────── */

export function CareerView() {
  const {
    isLoading,
    totalTournaments,
    stakesProgression,
    milestones,
    stakingDeals,
    newDealState,
    onNewDealChange,
    onAddStakingDeal,
    onRemoveStakingDeal,
  } = useCareerViewModel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p
          className="font-data text-sm tracking-[0.1em] uppercase animate-pulse"
          style={{ color: MUTED }}
        >
          Carregando carreira…
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
            Carreira
          </p>
          <h1
            className="font-display text-3xl font-bold text-text-primary leading-none"
            style={{ letterSpacing: "0.02em" }}
          >
            Progressão
          </h1>
        </div>
        <p
          className="font-data text-[11px] uppercase tracking-[0.2em]"
          style={{ color: MUTED }}
        >
          {totalTournaments} torneios
        </p>
      </header>

      {stakesProgression && (
        <StakesProgressionSection
          prog={stakesProgression}
          totalTournaments={totalTournaments}
        />
      )}

      {milestones.length > 0 && (
        <MilestonesTimeline milestones={milestones} />
      )}

      <StakingTracker
        deals={stakingDeals}
        newDeal={newDealState}
        onChange={onNewDealChange}
        onAdd={onAddStakingDeal}
        onRemove={onRemoveStakingDeal}
      />
    </div>
  );
}
