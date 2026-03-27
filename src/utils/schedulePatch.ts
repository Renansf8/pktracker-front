import type { ScheduleTournament } from "@/services/hooks/schedule.types";

export type ScheduleEditDraft = {
  time: string;
  platform: string;
  name: string;
  currency: string;
  buyIn: number | string;
};

function normStr(v: unknown): string {
  return String(v ?? "").trim();
}

function normNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function buildSchedulePatch(
  original: ScheduleTournament,
  draft: ScheduleEditDraft,
): Partial<Omit<ScheduleTournament, "id">> {
  const patch: Partial<Omit<ScheduleTournament, "id">> = {};

  const nextTime = normStr(draft.time);
  if (nextTime && nextTime !== normStr(original.time)) {
    patch.time = nextTime;
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

  return patch;
}

