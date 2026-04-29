"use client";

import { useState } from "react";

const LS_KEY = "pktracker:daily-buyin-limit-pct";
export const DEFAULT_DAILY_BUYIN_LIMIT_PCT = 7;

function readStored(): number {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_DAILY_BUYIN_LIMIT_PCT;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_BUYIN_LIMIT_PCT;
  } catch {
    return DEFAULT_DAILY_BUYIN_LIMIT_PCT;
  }
}

export function useDailyBuyInLimit() {
  const [limitPct, setLimitPctState] = useState<number>(readStored);

  const setLimitPct = (value: number) => {
    setLimitPctState(value);
    try {
      localStorage.setItem(LS_KEY, String(value));
    } catch {}
  };

  return { limitPct, setLimitPct };
}
