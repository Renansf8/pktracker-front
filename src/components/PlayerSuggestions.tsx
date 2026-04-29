"use client";

import { useState } from "react";
import {
  getAbiSuggestedRange,
  getAbiForCustomBuyIns,
  getSuggestedStakeLevels,
} from "@/utils/abiSuggestion";
import {
  getDailyBuyInToBankRatio,
  shouldWarnDailyBuyInExposure,
} from "@/utils/dailyBuyInExposure";
import { useDailyBuyInLimit } from "@/utils/useDailyBuyInLimit";
import { useDayStartBank } from "@/utils/useDayStartBank";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

const money = (n: number) =>
  `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type AbiSuggestionCardProps = {
  bankUsd: number;
};

const ABI_STORAGE_KEY = "pktracker:abi-buy-ins";

function readStoredBuyIns(): number | null {
  try {
    const raw = localStorage.getItem(ABI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function AbiSuggestionCard({ bankUsd }: AbiSuggestionCardProps) {
  const [customBuyInsInput, setCustomBuyInsInput] = useState<string>("");
  const [appliedBuyIns, setAppliedBuyIns] = useState<number | null>(
    () => readStoredBuyIns(),
  );

  const parsedInput = parseFloat(customBuyInsInput);
  const isValidInput = Number.isFinite(parsedInput) && parsedInput > 0;

  function handleApply() {
    if (!isValidInput) return;
    setAppliedBuyIns(parsedInput);
    localStorage.setItem(ABI_STORAGE_KEY, String(parsedInput));
    setCustomBuyInsInput("");
  }

  const isCustom = appliedBuyIns !== null;
  const abiCustom = isCustom ? getAbiForCustomBuyIns(bankUsd, appliedBuyIns!) : null;
  const abiRange = isCustom ? null : getAbiSuggestedRange(bankUsd);

  const displayMin = abiCustom ?? abiRange?.min ?? null;
  const displayMax = abiCustom ?? abiRange?.max ?? null;

  const stakes =
    displayMin !== null && displayMax !== null
      ? getSuggestedStakeLevels(displayMin, displayMax)
      : null;

  const hasValidBank = displayMin !== null;

  return (
    <article className="glass-panel flex flex-col gap-4 rounded-3xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-cyan-300/90">
            Gestão de banca
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-slate-100">
            ABI ideal para sua banca
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <label
            htmlFor="custom-buy-ins"
            className="text-xs text-slate-500 whitespace-nowrap"
          >
            Qtd. de buy-ins
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              id="custom-buy-ins"
              type="number"
              min={1}
              step={1}
              placeholder="500"
              value={customBuyInsInput}
              onChange={(e) => setCustomBuyInsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="h-8 w-20 rounded-lg border-white/10 bg-white/5 px-2 text-right text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-cyan-400/50"
            />
            <button
              onClick={handleApply}
              disabled={!isValidInput}
              className="h-8 rounded-lg bg-cyan-500/20 px-3 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {hasValidBank ? (
        <>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-200">
            <li className="flex flex-wrap gap-x-2 border-b border-white/5 pb-2">
              <span className="text-slate-500">Banca</span>
              <span className="font-medium text-slate-100">{money(bankUsd)}</span>
            </li>
            <li className="flex flex-wrap gap-x-2 border-b border-white/5 pb-2">
              <span className="text-slate-500">Regra</span>
              <span>
                {isCustom && appliedBuyIns !== null
                  ? `${Math.round(appliedBuyIns)} buy-ins`
                  : "100 a 150 buy-ins"}
              </span>
            </li>
            <li className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
              <span className="text-slate-500">Seu ABI ideal</span>
              <span className="font-semibold text-cyan-200">
                {isCustom && abiCustom !== null
                  ? money(abiCustom)
                  : `${money(displayMin!)} a ${money(displayMax!)}`}
              </span>
            </li>
          </ul>

          {stakes && (
            <div className="glass-inner rounded-xl border border-white/10 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Foco de stakes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Torneios de{" "}
                <span className="font-semibold text-slate-100">
                  {money(stakes.low)}
                </span>{" "}
                e alguns de{" "}
                <span className="font-semibold text-slate-100">
                  {money(stakes.high)}
                </span>{" "}
                intercalados.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-slate-400">
          Quando sua banca em USD estiver disponível, mostramos aqui uma faixa
          de ABI e stakes sugeridos com base na regra de 100 a 150 buy-ins.
        </p>
      )}
    </article>
  );
}

type DailyBuyInExposureCardProps = {
  bankUsd: number;
  todayTotalBuyIn: number;
};

function DailyBuyInExposureCard({
  bankUsd,
  todayTotalBuyIn,
}: DailyBuyInExposureCardProps) {
  const { limitPct } = useDailyBuyInLimit();
  // Usa o saldo do início do dia como base fixa; fallback para o valor atual
  // enquanto o snapshot ainda não foi criado (primeiro acesso do dia).
  const dayStartBank = useDayStartBank(bankUsd);
  const referenceBank = dayStartBank ?? bankUsd;

  const ratio = getDailyBuyInToBankRatio(referenceBank, todayTotalBuyIn);
  const show = ratio !== null && shouldWarnDailyBuyInExposure(referenceBank, todayTotalBuyIn, limitPct);

  if (!show || ratio === null) {
    return null;
  }

  const pct = (ratio * 100).toFixed(1);
  const refPct = limitPct.toFixed(0);
  const sevenPercentOfBankUsd = referenceBank * (limitPct / 100);

  return (
    <article className="glass-panel flex flex-col gap-4 rounded-3xl border border-red-500/40 p-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-red-300/90">
          Buy-ins do dia
        </span>
        <div className="flex items-start gap-2.5">
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-red-400/90"
            aria-hidden
            strokeWidth={2}
          />
          <h3 className="text-lg font-semibold tracking-tight text-red-100">
            Atenção à exposição na banca
          </h3>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-300">
        Hoje você já acumulou{" "}
        <span className="font-semibold text-slate-100">
          {money(todayTotalBuyIn)}
        </span>{" "}
        em buy-ins (~{pct}% da sua banca). Você está se aproximando de{" "}
        <span className="font-semibold text-red-200">{refPct}%</span>{" "}
        <span className="text-slate-400">({money(sevenPercentOfBankUsd)})</span>{" "}
        do valor total da banca em relação aos buy-ins do dia. Vale considerar{" "}
        <span className="font-medium text-slate-100">
          não passar de 7% em buy ins
        </span>
        , a menos que faça sentido para o seu plano.
      </p>
    </article>
  );
}

type PlayerSuggestionsProps = {
  bankUsd: number;
  todayTotalBuyIn: number;
};

/**
 * Bloco de sugestões na Home — preparado para novos cards lado a lado (grid responsivo).
 */
export function PlayerSuggestions({
  bankUsd,
  todayTotalBuyIn,
}: PlayerSuggestionsProps) {
  return (
    <section className="mt-8 flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
        Sugestões
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AbiSuggestionCard bankUsd={bankUsd} />
        <DailyBuyInExposureCard
          bankUsd={bankUsd}
          todayTotalBuyIn={todayTotalBuyIn}
        />
      </div>
    </section>
  );
}
