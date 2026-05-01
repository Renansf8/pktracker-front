"use client";

import { useMemo } from "react";
import { useGetUser } from "./useGetUser";
import { useCurrency } from "./useCurrency";
import { useTournaments } from "./useTournaments";
import { getEurToUsdRate } from "@/utils/currencyConvert";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";
import type { Tournament } from "./types";

/**
 * Retorna o saldo da banca corrigido para torneios importados via grade.
 * O backend armazena profit=0 para torneios não finalizados, então o valor
 * de bank retornado pela API é incorreto. Aqui recalculamos substituindo o
 * profit armazenado pelo lucro real (result - buyIn) de todos os torneios.
 */
export function useCorrectedBank() {
  const { data: user } = useGetUser();
  const { currencies } = useCurrency();
  const { getAllTournaments } = useTournaments("", 1, 500);
  const { data: tournamentsResponse } = getAllTournaments;

  const tournaments = useMemo<Tournament[]>(
    () => tournamentsResponse?.data?.data ?? [],
    [tournamentsResponse],
  );
  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);

  const totalWinnings = useMemo(
    () => tournaments.reduce((acc: number, t) => acc + getTournamentLucroUsd(t, eurToUsdRate), 0),
    [tournaments, eurToUsdRate],
  );

  const bankUsd = useMemo(() => {
    const backendBank = user?.bank?.bank ?? 0;
    const backendProfit = user?.bank?.profit ?? 0;
    return backendBank - backendProfit + totalWinnings;
  }, [user?.bank?.bank, user?.bank?.profit, totalWinnings]);

  return { bankUsd, totalWinnings };
}
