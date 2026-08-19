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
import {
  convertUsdToBrl,
  getEurToUsdRate,
  toUsd,
} from "@/utils/currencyConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";
import {
  convertIsoDateToBr,
  isSameCalendarDayLocal,
} from "@/utils/dateConvert";
import { useMemo, useState } from "react";
import type { HomeViewProps } from "./home.types";

function toNum(v: unknown): number {
  if (typeof v === "string" && v.toLowerCase() === "ticket") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function useHomeViewModel(): HomeViewProps {
  const { data: user, isLoading } = useGetUser();
  const { currencies } = useCurrency();
  const { getAllTournaments } = useTournaments({ limit: 9999 });
  const { data: tournamentsResponse } = getAllTournaments;

  const bankUsd = user?.bank?.bank ?? 0;

  const tournaments: Tournament[] = useMemo(
    () => tournamentsResponse?.data?.data ?? [],
    [tournamentsResponse],
  );
  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);

  const [thisYear] = useState(() => new Date().getFullYear());
  const [thisMonth] = useState(() => new Date().getMonth());

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
    () =>
      todayTournaments.reduce(
        (acc, t) => acc + toUsd(toNum(t.buyIn), t.currency, eurToUsdRate),
        0,
      ),
    [todayTournaments, eurToUsdRate],
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
        totalBuyIn:
          acc.totalBuyIn + toUsd(toNum(t.buyIn), t.currency, eurToUsdRate),
        totalProfit:
          acc.totalProfit + toUsd(toNum(t.result), t.currency, eurToUsdRate),
        totalWinnings:
          acc.totalWinnings + getTournamentLucroUsd(t, eurToUsdRate),
      }),
      initial,
    );
    const totalTournaments = tournaments.length;
    const itmCount = tournaments.filter((t) => t.itm === true).length;
    const byDateDesc = [...tournaments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const ftTournaments = byDateDesc.filter((t) => t.hasFt === true);
    const ftCount = ftTournaments.length;
    const goldTournaments = byDateDesc.filter((t) => t.position === 1);
    const silverTournaments = byDateDesc.filter((t) => t.position === 2);
    const bronzeTournaments = byDateDesc.filter((t) => t.position === 3);
    const goldCount = goldTournaments.length;
    const silverCount = silverTournaments.length;
    const bronzeCount = bronzeTournaments.length;
    const distinctDays = new Set(
      tournaments.map((t) => String(t.date).split("T")[0]),
    ).size;
    return {
      ...reduced,
      totalTournaments,
      abi: totalTournaments > 0 ? reduced.totalBuyIn / totalTournaments : 0,
      itmPercentage:
        totalTournaments > 0 ? (itmCount / totalTournaments) * 100 : 0,
      itmCount,
      ftCount,
      ftTournaments,
      avgDailyBuyIn: distinctDays > 0 ? reduced.totalBuyIn / distinctDays : 0,
      goldCount,
      silverCount,
      bronzeCount,
      goldTournaments,
      silverTournaments,
      bronzeTournaments,
    };
  }, [tournaments, eurToUsdRate]);

  const bankDisplayText = useMemo(() => {
    const usdFormatted = bankUsd.toFixed(2);
    const brl =
      currencies?.data?.rates?.BRL !== undefined
        ? convertUsdToBrl(currencies.data.rates.BRL * bankUsd)
        : "0.00";
    return `$ ${usdFormatted} (${brl})`;
  }, [bankUsd, currencies?.data?.rates?.BRL]);

  const monthlyProfitUsd = useMemo(() => {
    return tournaments
      .filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
      })
      .reduce((acc, t) => acc + getTournamentLucroUsd(t, eurToUsdRate), 0);
  }, [tournaments, eurToUsdRate, thisYear, thisMonth]);

  const yearlyProfitUsd = useMemo(() => {
    return tournaments
      .filter((t) => new Date(t.date).getFullYear() === thisYear)
      .reduce((acc, t) => acc + getTournamentLucroUsd(t, eurToUsdRate), 0);
  }, [tournaments, eurToUsdRate, thisYear]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return null;
    const d = new Date(user.createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  }, [user?.createdAt]);

  return {
    isLoading,
    userName: user?.name ?? "",
    memberSince,
    bankDisplayText,
    bankUsd,
    todayTotalBuyIn,
    totalTournaments: stats.totalTournaments,
    totalBuyIn: stats.totalBuyIn,
    abi: stats.abi,
    totalProfit: stats.totalProfit,
    totalWinnings: (user?.bank?.profit ?? 0) + (user?.bank?.totalRake ?? 0),
    itmPercentage: stats.itmPercentage,
    itmCount: stats.itmCount,
    ftCount: stats.ftCount,
    ftTournaments: stats.ftTournaments,
    avgDailyBuyIn: stats.avgDailyBuyIn,
    goldCount: stats.goldCount,
    silverCount: stats.silverCount,
    bronzeCount: stats.bronzeCount,
    goldTournaments: stats.goldTournaments,
    silverTournaments: stats.silverTournaments,
    bronzeTournaments: stats.bronzeTournaments,
    monthlyProfitUsd,
    yearlyProfitUsd,
  };
}
