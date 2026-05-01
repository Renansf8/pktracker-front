"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useStats } from "@/services/hooks/useStats";
import { useCurrency } from "@/services/hooks/useCurrency";
import { getTournamentLucroUsd } from "@/utils/tournamentLucro";
import { getEurToUsdRate } from "@/utils/currencyConvert";
import { getAbiSuggestedRange } from "@/utils/abiSuggestion";
import type { Tournament } from "@/services/hooks/types";
import type {
  CareerViewProps,
  Milestone,
  NewDealState,
  StakesProgression,
  StakingDeal,
} from "./career.types";

const COMMON_STAKES = [1, 2, 2.2, 3.3, 5.5, 8.8, 11, 16.5, 22, 33, 55, 109];
const LS_STAKING_KEY = "pktracker:staking-deals";
const ABI_STORAGE_KEY = "pktracker:abi-buy-ins";

function readCustomBuyIns(): number | null {
  try {
    const raw = localStorage.getItem(ABI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function readStakingDeals(): StakingDeal[] {
  try {
    const raw = localStorage.getItem(LS_STAKING_KEY);
    return raw ? (JSON.parse(raw) as StakingDeal[]) : [];
  } catch {
    return [];
  }
}

function writeStakingDeals(deals: StakingDeal[]): void {
  try {
    localStorage.setItem(LS_STAKING_KEY, JSON.stringify(deals));
  } catch {}
}

function computeStakesProgression(
  bankUsd: number,
  customBuyIns: number | null,
): StakesProgression | null {
  if (!Number.isFinite(bankUsd) || bankUsd <= 0) return null;

  let rangeMin: number;
  let rangeMax: number;
  let effectiveBuyIns: number;

  if (customBuyIns !== null) {
    const abi = bankUsd / customBuyIns;
    rangeMin = abi;
    rangeMax = abi;
    effectiveBuyIns = customBuyIns;
  } else {
    const range = getAbiSuggestedRange(bankUsd);
    if (!range) return null;
    rangeMin = range.min;
    rangeMax = range.max;
    effectiveBuyIns = 100;
  }

  const currentStake =
    [...COMMON_STAKES].reverse().find((s) => s <= rangeMax) ??
    COMMON_STAKES[0];
  const idx = COMMON_STAKES.indexOf(currentStake);
  const nextStake =
    idx < COMMON_STAKES.length - 1 ? COMMON_STAKES[idx + 1] : null;
  const bankNeededForNext = nextStake ? nextStake * effectiveBuyIns : null;
  const progressToNext = bankNeededForNext
    ? Math.min((bankUsd / bankNeededForNext) * 100, 100)
    : 100;

  return {
    currentStake,
    nextStake,
    bankNeededForNext,
    progressToNext,
    bankUsd,
    rangeMin,
    rangeMax,
    customBuyIns,
  };
}

function extractMilestones(
  tournaments: Tournament[],
  eurToUsdRate: number,
): Milestone[] {
  const sorted = [...tournaments].sort(
    (a, b) =>
      new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime(),
  );
  const milestones: Milestone[] = [];

  if (sorted.length > 0) {
    milestones.push({
      id: "first",
      label: "Primeiro torneio",
      sublabel: sorted[0].name,
      date: String(sorted[0].date),
      icon: "◆",
    });
  }

  const firstItm = sorted.find((t) => t.itm);
  if (firstItm) {
    milestones.push({
      id: "first_itm",
      label: "Primeiro ITM",
      sublabel: firstItm.name,
      date: String(firstItm.date),
      icon: "▲",
    });
  }

  const firstFt = sorted.find((t) => t.hasFt);
  if (firstFt) {
    milestones.push({
      id: "first_ft",
      label: "Primeira final table",
      sublabel: firstFt.name,
      date: String(firstFt.date),
      icon: "★",
    });
  }

  const firstDay2 = sorted.find((t) => t.hasSecondDay);
  if (firstDay2) {
    milestones.push({
      id: "first_day2",
      label: "Primeiro Day 2",
      sublabel: firstDay2.name,
      date: String(firstDay2.date),
      icon: "◉",
    });
  }

  for (const n of [10, 50, 100, 250, 500]) {
    if (sorted.length >= n) {
      milestones.push({
        id: `t${n}`,
        label: `${n}º torneio`,
        sublabel: sorted[n - 1].name,
        date: String(sorted[n - 1].date),
        icon: "◇",
      });
    }
  }

  let biggestWin: Tournament | null = null;
  let biggestWinValue = 0;
  for (const t of sorted) {
    const profit = getTournamentLucroUsd(t, eurToUsdRate);
    if (profit > biggestWinValue) {
      biggestWinValue = profit;
      biggestWin = t;
    }
  }
  if (biggestWin) {
    milestones.push({
      id: "biggest_win",
      label: "Maior vitória",
      sublabel: biggestWin.name,
      date: String(biggestWin.date),
      value: biggestWinValue,
      icon: "◈",
    });
  }

  return milestones.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function useCareerViewModel(): CareerViewProps {
  const { data: user, isLoading: userLoading } = useGetUser();
  const { getAllTournamentsForStats } = useStats();
  // isPending: true enquanto não há dados (evita flash de 0 torneios no mount)
  const { data: tournamentsData, isPending: tournamentsLoading } =
    getAllTournamentsForStats;
  const { currencies } = useCurrency();

  const [customBuyIns] = useState<number | null>(() => readCustomBuyIns());

  const eurToUsdRate = getEurToUsdRate(currencies?.data?.rates);
  const tournaments: Tournament[] = useMemo(
    () => tournamentsData?.data?.data ?? [],
    [tournamentsData],
  );

  const totalWinnings = useMemo(
    () =>
      tournaments.reduce(
        (acc, t) => acc + getTournamentLucroUsd(t, eurToUsdRate),
        0,
      ),
    [tournaments, eurToUsdRate],
  );

  const bankUsd = useMemo(() => {
    const backendBank = user?.bank?.bank ?? 0;
    const backendProfit = user?.bank?.profit ?? 0;
    return backendBank - backendProfit + totalWinnings;
  }, [user?.bank?.bank, user?.bank?.profit, totalWinnings]);

  const stakesProgression = useMemo(
    () => computeStakesProgression(bankUsd, customBuyIns),
    [bankUsd, customBuyIns],
  );

  const milestones = useMemo(
    () => extractMilestones(tournaments, eurToUsdRate),
    [tournaments, eurToUsdRate],
  );

  const [stakingDeals, setStakingDeals] = useState<StakingDeal[]>([]);
  const [newDeal, setNewDeal] = useState<NewDealState>({
    backerName: "",
    myPct: "",
    markup: "",
    notes: "",
  });

  useEffect(() => {
    setStakingDeals(readStakingDeals());
  }, []);

  const onNewDealChange = useCallback((field: string, value: string) => {
    setNewDeal((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onAddStakingDeal = useCallback(() => {
    const myPct = parseFloat(newDeal.myPct);
    const markup = parseFloat(newDeal.markup || "1");
    if (
      !newDeal.backerName.trim() ||
      !Number.isFinite(myPct) ||
      myPct <= 0 ||
      myPct > 100
    )
      return;
    const deal: StakingDeal = {
      id: crypto.randomUUID(),
      backerName: newDeal.backerName.trim(),
      myPct,
      markup: Number.isFinite(markup) && markup > 0 ? markup : 1,
      notes: newDeal.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...stakingDeals, deal];
    setStakingDeals(updated);
    writeStakingDeals(updated);
    setNewDeal({ backerName: "", myPct: "", markup: "", notes: "" });
  }, [newDeal, stakingDeals]);

  const onRemoveStakingDeal = useCallback(
    (id: string) => {
      const updated = stakingDeals.filter((d) => d.id !== id);
      setStakingDeals(updated);
      writeStakingDeals(updated);
    },
    [stakingDeals],
  );

  return {
    isLoading: userLoading || tournamentsLoading,
    totalTournaments: tournaments.length,
    stakesProgression,
    milestones,
    stakingDeals,
    newDealState: newDeal,
    onNewDealChange,
    onAddStakingDeal,
    onRemoveStakingDeal,
  };
}
