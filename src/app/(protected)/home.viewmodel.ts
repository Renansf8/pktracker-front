/**
 * src/app/(protected)/home.viewmodel.ts
 * ---------------------------------------------------------------------------
 * ViewModel da Home. É praticamente idêntico ao da versão SPA — só mudou
 * o path dos imports (que continuam usando `@/`).
 *
 * Continua usando TanStack Query via `useGetUser` / `useTournaments` /
 * `useCurrency`. Esses hooks agora batem em `/api/proxy/...` (ver
 * `src/services/api/client.ts`), que injeta o token server-side.
 */
"use client";

import type { Tournament } from "@/services/hooks/types";
import { useCurrency } from "@/services/hooks/useCurrency";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useTournaments } from "@/services/hooks/useTournaments";
import { convertUsdToBrl } from "@/utils/currencyConvert";
import { convertIsoDateToBr, isSameCalendarDayLocal } from "@/utils/dateConvert";
import { useMemo } from "react";
import type { HomeViewProps } from "./home.types";

/** Converte buyIn/result para número, ignorando "ticket" (retorna 0). */
function toNum(v: unknown): number {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useHomeViewModel(): HomeViewProps {
  const { data: user, isLoading } = useGetUser();
  const { currencies } = useCurrency();
  const { getAllTournaments } = useTournaments("", 1, 500);
  const { data: tournamentsResponse } = getAllTournaments;

  const tournaments: Tournament[] = tournamentsResponse?.data?.data ?? [];

  const todayBr = useMemo(() => {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;
  }, []);

  const todayTournaments = useMemo(() => {
    if (!tournaments.length) return [];
    const ref = new Date();
    return tournaments.filter((t) => {
      const byCalendar = isSameCalendarDayLocal(t.date, ref);
      const datePart = convertIsoDateToBr(String(t.date)).split(" ")[0];
      const byLegacyString = datePart === todayBr;
      return byCalendar || byLegacyString;
    });
  }, [tournaments, todayBr]);

  const todayTotalBuyIn = useMemo(
    () => todayTournaments.reduce((acc, t) => acc + toNum(t.buyIn), 0),
    [todayTournaments],
  );

  const stats = useMemo(() => {
    type StatsAcc = {
      totalBuyIn: number;
      totalProfit: number;
      totalWinnings: number;
    };
    const initial: StatsAcc = {
      totalBuyIn: 0,
      totalProfit: 0,
      totalWinnings: 0,
    };
    const reduced = tournaments.reduce<StatsAcc>(
      (acc, t) => ({
        totalBuyIn: acc.totalBuyIn + toNum(t.buyIn),
        totalProfit: acc.totalProfit + toNum(t.result),
        totalWinnings: acc.totalWinnings + toNum(t.profit ?? 0),
      }),
      initial,
    );
    const totalTournaments = tournaments.length;
    const itmCount = tournaments.filter((t) => t.itm === true).length;
    const ftCount = tournaments.filter((t) => t.hasFt === true).length;
    const distinctDays = new Set(
      tournaments.map((t) => String(t.date).split("T")[0])
    ).size;
    return {
      ...reduced,
      totalTournaments,
      abi: totalTournaments > 0 ? reduced.totalBuyIn / totalTournaments : 0,
      itmPercentage: totalTournaments > 0 ? (itmCount / totalTournaments) * 100 : 0,
      itmCount,
      ftCount,
      avgDailyBuyIn: distinctDays > 0 ? reduced.totalBuyIn / distinctDays : 0,
    };
  }, [tournaments]);

  const bankDisplayText = useMemo(() => {
    const usd = user?.bank?.bank;
    const usdFormatted = usd !== undefined ? usd.toFixed(2) : "0.00";
    const brl =
      usd !== undefined && currencies?.data?.rates?.BRL !== undefined
        ? convertUsdToBrl(currencies.data.rates.BRL * usd)
        : "0.00";
    return `$ ${usdFormatted} (${brl})`;
  }, [user?.bank?.bank, currencies?.data?.rates?.BRL]);

  const bankUsd = user?.bank?.bank ?? 0;

  return {
    isLoading,
    userName: user?.name ?? "",
    bankDisplayText,
    bankUsd,
    todayTotalBuyIn,
    totalTournaments: stats.totalTournaments,
    totalBuyIn: stats.totalBuyIn,
    abi: stats.abi,
    totalProfit: stats.totalProfit,
    totalWinnings: stats.totalWinnings,
    itmPercentage: stats.itmPercentage,
    itmCount: stats.itmCount,
    ftCount: stats.ftCount,
    avgDailyBuyIn: stats.avgDailyBuyIn,
  };
}
