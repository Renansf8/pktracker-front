import type { Tournament } from "@/services/hooks/types";

export type TournamentEditDraft = {
  date: string;
  platform: string;
  name: string;
  currency: string;
  buyIn: number | string;
  result: number | string;
};

function normStr(v: unknown): string {
  return String(v ?? "").trim();
}

function normNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Gera um PATCH parcial com apenas os campos alterados.
 * - Normaliza `buyIn` e `result` como número.
 * - Trata strings com trim.
 */
export function buildTournamentPatch(
  original: Tournament,
  draft: TournamentEditDraft,
): Partial<Omit<Tournament, "id">> {
  const patch: Partial<Omit<Tournament, "id">> = {};

  const nextDate = normStr(draft.date);
  if (nextDate && nextDate !== normStr(original.date)) {
    patch.date = nextDate;
  }

  const nextPlatform = normStr(draft.platform);
  if (nextPlatform && nextPlatform !== normStr(original.platform)) {
    patch.platform = nextPlatform;
  }

  const nextName = normStr(draft.name);
  if (nextName && nextName !== normStr(original.name)) {
    patch.name = nextName;
  }

  const nextCurrency = normStr(draft.currency);
  if (nextCurrency && nextCurrency !== normStr(original.currency)) {
    patch.currency = nextCurrency;
  }

  const nextBuyIn = normNum(draft.buyIn);
  if (nextBuyIn !== normNum(original.buyIn)) {
    patch.buyIn = nextBuyIn;
  }

  const nextResult = normNum(draft.result);
  if (nextResult !== normNum(original.result)) {
    patch.result = nextResult;
  }

  return patch;
}

