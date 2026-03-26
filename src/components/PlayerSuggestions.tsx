import {
  getAbiSuggestedRange,
  getSuggestedStakeLevels,
} from "@/utils/abiSuggestion";

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

type PlayerSuggestionsProps = {
  bankUsd: number;
};

/**
 * Bloco de sugestões na Home — preparado para novos cards lado a lado (grid responsivo).
 */
export function PlayerSuggestions({ bankUsd }: PlayerSuggestionsProps) {
  return (
    <section className="mt-8 flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
        Sugestões
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AbiSuggestionCard bankUsd={bankUsd} />
      </div>
    </section>
  );
}
