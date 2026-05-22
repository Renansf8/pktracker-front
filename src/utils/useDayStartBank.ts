"use client";

import { useEffect, useState } from "react";

const LS_KEY = "pktracker:day-start-bank";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useDayStartBank(currentBankUsd: number): number | null {
  const [dayStartBank, setDayStartBank] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { date: string; bankUsd: number };
      if (
        parsed.date === getTodayKey() &&
        Number.isFinite(parsed.bankUsd) &&
        parsed.bankUsd > 0
      ) {
        return parsed.bankUsd;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (!Number.isFinite(currentBankUsd) || currentBankUsd <= 0) return;

    const today = getTodayKey();
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { date: string; bankUsd: number };
        // Atualiza snapshot se: novo dia OU banca aumentou (depósito/correção manual)
        if (parsed.date === today && currentBankUsd <= parsed.bankUsd) return;
      }
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ date: today, bankUsd: currentBankUsd }),
      );
      setDayStartBank(currentBankUsd);
    } catch {}
  }, [currentBankUsd]);

  return dayStartBank;
}
