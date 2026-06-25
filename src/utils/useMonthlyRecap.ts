"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTournaments } from "@/services/hooks/useTournaments";
import { useCurrency } from "@/services/hooks/useCurrency";
import { getEurToUsdRate, toUsd } from "@/utils/currencyConvert";
import { parseTournamentDateLocal } from "@/utils/dateConvert";
import type { Tournament } from "@/services/hooks/types";

function toNum(v: unknown): number {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const LS_KEY = "pk_monthly_recap_seen";
const MIN_PROFIT_USD = 300;

export interface MonthlyRecapTournament extends Tournament {
  resultUsd: number;
}

export function useMonthlyRecap() {
  const [open, setOpen] = useState(false);
  const triggeredRef = useRef(false);

  const isFirstDay = useMemo(() => new Date().getDate() === 1, []);

  const { prevMonth, prevYear, prevMonthKey } = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    return { prevMonth: month, prevYear: year, prevMonthKey: key };
  }, []);

  const { getAllTournaments } = useTournaments("", 1, 9999);
  const { data: tournamentsResponse } = getAllTournaments;
  const { currencies } = useCurrency();
  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);

  const tournaments: Tournament[] = useMemo(
    () => tournamentsResponse?.data?.data ?? [],
    [tournamentsResponse],
  );

  const bigWins = useMemo<MonthlyRecapTournament[]>(() => {
    if (!isFirstDay || !tournaments.length) return [];
    return tournaments
      .filter((t) => {
        const d = parseTournamentDateLocal(String(t.date));
        if (Number.isNaN(d.getTime())) return false;
        const resultUsd = toUsd(toNum(t.result), t.currency, eurToUsdRate);
        return (
          d.getFullYear() === prevYear &&
          d.getMonth() === prevMonth &&
          resultUsd >= MIN_PROFIT_USD
        );
      })
      .map((t) => ({ ...t, resultUsd: toUsd(toNum(t.result), t.currency, eurToUsdRate) }))
      .sort((a, b) => b.resultUsd - a.resultUsd);
  }, [tournaments, isFirstDay, prevMonth, prevYear, eurToUsdRate]);

  useEffect(() => {
    if (!isFirstDay || triggeredRef.current) return;
    if (!tournamentsResponse) return;

    const seen = localStorage.getItem(LS_KEY);
    if (seen === prevMonthKey) {
      triggeredRef.current = true;
      return;
    }

    if (bigWins.length > 0) {
      triggeredRef.current = true;
      setOpen(true);
    }
  }, [isFirstDay, tournamentsResponse, prevMonthKey, bigWins]);

  function dismiss() {
    localStorage.setItem(LS_KEY, prevMonthKey);
    setOpen(false);
  }

  return { open, dismiss, bigWins, prevMonth, prevYear };
}
