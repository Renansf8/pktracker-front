import type { Tournament } from "@/services/hooks/types";
import { useCurrency } from "@/services/hooks/useCurrency";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useTournaments } from "@/services/hooks/useTournaments";
import { convertUsdToBrl } from "@/utils/currencyConvert";
import { useMemo } from "react";
import type { HomeViewProps } from "./home.types";

export function useHomeViewModel(): HomeViewProps {
  const { data: user, isLoading } = useGetUser();
  const { currencies } = useCurrency();
  const { getAllTournaments } = useTournaments();
  const { data: tournamentsResponse } = getAllTournaments;

  const tournaments: Tournament[] = tournamentsResponse?.data?.data ?? [];

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
        totalBuyIn: acc.totalBuyIn + Number(t.buyIn),
        totalProfit: acc.totalProfit + Number(t.result),
        totalWinnings: acc.totalWinnings + Number(t.profit ?? 0),
      }),
      initial,
    );
    const totalTournaments = tournaments.length;
    return {
      ...reduced,
      totalTournaments,
      abi: totalTournaments > 0 ? reduced.totalBuyIn / totalTournaments : 0,
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

  return {
    isLoading,
    userName: user?.name ?? "",
    bankDisplayText,
    totalTournaments: stats.totalTournaments,
    totalBuyIn: stats.totalBuyIn,
    abi: stats.abi,
    totalProfit: stats.totalProfit,
    totalWinnings: stats.totalWinnings,
  };
}
