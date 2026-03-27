import {
  getAbiSuggestedRange,
  getSuggestedStakeLevels,
} from "@/utils/abiSuggestion";
import {
  DAILY_BUYIN_REFERENCE_RATIO,
  getDailyBuyInToBankRatio,
  shouldWarnDailyBuyInExposure,
} from "@/utils/dailyBuyInExposure";
import { AlertTriangle } from "lucide-react";

const money = (n: number) =>
  `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type AbiSuggestionCardProps = {
  bankUsd: number;
};

function AbiSuggestionCard({ bankUsd }: AbiSuggestionCardProps) {
  const range = getAbiSuggestedRange(bankUsd);
  const stakes =
    range !== null ? getSuggestedStakeLevels(range.min, range.max) : null;

  if (range === null || stakes === null) {
    return (
      <article className="glass-panel flex flex-col gap-3 rounded-3xl p-5">
        <h3 className="text-base font-semibold tracking-tight text-slate-100">
          ABI ideal para sua banca
        </h3>
        <p className="text-sm leading-relaxed text-slate-400">
          Quando sua banca em USD estiver disponível, mostramos aqui uma faixa
          de ABI e stakes sugeridos com base na regra de 100 a 150 buy-ins.
        </p>
      </article>
    );
  }

  return (
    <article className="glass-panel flex flex-col gap-4 rounded-3xl p-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-cyan-300/90">
          Gestão de banca
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-slate-100">
          ABI ideal para sua banca
        </h3>
      </div>

      <ul className="flex flex-col gap-2.5 text-sm text-slate-200">
        <li className="flex flex-wrap gap-x-2 border-b border-white/5 pb-2">
          <span className="text-slate-500">Banca</span>
          <span className="font-medium text-slate-100">{money(bankUsd)}</span>
        </li>
        <li className="flex flex-wrap gap-x-2 border-b border-white/5 pb-2">
          <span className="text-slate-500">Regra</span>
          <span>100 a 150 buy-ins</span>
        </li>
        <li className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
          <span className="text-slate-500">Seu ABI ideal</span>
          <span className="font-semibold text-cyan-200">
            {money(range.min)} a {money(range.max)}
          </span>
        </li>
      </ul>

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
  const ratio = getDailyBuyInToBankRatio(bankUsd, todayTotalBuyIn);
  const show = ratio !== null && shouldWarnDailyBuyInExposure(bankUsd, todayTotalBuyIn);

  if (!show || ratio === null) {
    return null;
  }

  const pct = (ratio * 100).toFixed(1);
  const refPct = (DAILY_BUYIN_REFERENCE_RATIO * 100).toFixed(0);
  const sevenPercentOfBankUsd = bankUsd * DAILY_BUYIN_REFERENCE_RATIO;

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
