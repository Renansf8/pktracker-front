"use client";

import { useEffect, useState } from "react";

const LS_KEY = "pktracker:day-start-bank";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Retorna o saldo da banca no início do dia corrente.
 *
 * Na primeira vez que o banco carrega em um novo dia, salva o valor como
 * snapshot e o usa como denominador fixo para o cálculo de exposição.
 * Mudanças intraday (buy-ins, etc.) não alteram esse valor.
 */
export function useDayStartBank(currentBankUsd: number): number | null {
  const [dayStartBank, setDayStartBank] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { date: string; bankUsd: number };
      if (parsed.date === getTodayKey() && Number.isFinite(parsed.bankUsd) && parsed.bankUsd > 0) {
        return parsed.bankUsd;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    // Só salva quando o banco estiver carregado (> 0) e não existir snapshot de hoje
    if (!Number.isFinite(currentBankUsd) || currentBankUsd <= 0) return;

    const today = getTodayKey();
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { date: string; bankUsd: number };
        if (parsed.date === today) return; // snapshot do dia já existe
      }
      localStorage.setItem(LS_KEY, JSON.stringify({ date: today, bankUsd: currentBankUsd }));
      setDayStartBank(currentBankUsd);
    } catch {}
  }, [currentBankUsd]);

  return dayStartBank;
}
