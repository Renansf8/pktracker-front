import type { Tournament } from "@/services/hooks/types";

export type TournamentEditDraft = {
  date: string;
  platform: string;
  name: string;
  currency: string;
  buyIn: number | string;
  result: number | string;
  itm: boolean;
  hasFt: boolean;
  hasSecondDay: boolean;
  position: string;
  type: string;
  speed: string;
};

function normStr(v: unknown): string {
  return String(v ?? "").trim();
}

function normNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normTicketOrNum(v: unknown): number | "ticket" {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return "ticket";
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

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

  const nextBuyIn = normTicketOrNum(draft.buyIn);
  if (nextBuyIn !== normTicketOrNum(original.buyIn)) {
    patch.buyIn = nextBuyIn;
  }

  const nextResult = normTicketOrNum(draft.result);
  if (nextResult !== normTicketOrNum(original.result)) {
    patch.result = nextResult;
  }

  const nextItm = draft.itm;
  if (nextItm !== (original.itm ?? false)) {
    patch.itm = nextItm;
  }

  const nextHasFt = draft.hasFt;
  if (nextHasFt !== (original.hasFt ?? false)) {
    patch.hasFt = nextHasFt;
  }

  const nextHasSecondDay = draft.hasSecondDay;
  if (nextHasSecondDay !== (original.hasSecondDay ?? false)) {
    patch.hasSecondDay = nextHasSecondDay;
  }

  const nextPosition = draft.position !== "" ? normNum(draft.position) : null;
  const originalPosition = original.position ?? null;
  if (nextPosition !== originalPosition) {
    patch.position = nextPosition;
  }

  const nextType = draft.type ? (draft.type as Tournament["type"]) : null;
  const originalType = original.type ?? null;
  if (nextType !== originalType) {
    patch.type = nextType;
  }

  const nextSpeed = draft.speed ? (draft.speed as Tournament["speed"]) : null;
  const originalSpeed = original.speed ?? null;
  if (nextSpeed !== originalSpeed) {
    patch.speed = nextSpeed;
  }

  return patch;
}
