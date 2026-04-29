/**
 * src/app/(protected)/bank/bank.viewmodel.ts
 * ---------------------------------------------------------------------------
 * ViewModel da Banca.
 *
 * Mantivemos o pattern TanStack Query (`useMutation` via `useBank`) aqui
 * em vez de converter pra Server Action. Motivo: as mutations são rápidas,
 * a UI precisa de feedback otimista imediato, e o axios está configurado
 * para chamar `/api/proxy` (que injeta o token). Server Actions brilham
 * mais em forms de submit único — em tela com dois botões que disparam
 * mutations recorrentes, o client pattern é mais ergonômico.
 *
 * Esta é uma decisão explicitamente admitida no CLAUDE.md §7.3:
 *     "Refetch interativo no client → continua usando TanStack Query"
 */
"use client";

import { useBank } from "@/services/hooks/useBank";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useState } from "react";
import { useDailyBuyInLimit } from "@/utils/useDailyBuyInLimit";
import type { BankViewProps } from "./bank.types";

export function useBankViewModel(): BankViewProps {
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [rakeAmount, setRakeAmount] = useState<number | undefined>(undefined);
  const [dailyLimitInput, setDailyLimitInput] = useState("");
  const { data: user, isLoading } = useGetUser();
  const { createDeposit, createWithdrawal, createRake } = useBank();
  const { limitPct: dailyLimitPct, setLimitPct: setDailyLimitPct } = useDailyBuyInLimit();

  const handleDeposit = () => {
    createDeposit.mutate({
      date: new Date().toISOString(),
      amount: amount ?? 0,
    });
    setAmount(undefined);
  };

  const handleWithdrawal = () => {
    createWithdrawal.mutate({
      date: new Date().toISOString(),
      amount: amount ?? 0,
    });
    setAmount(undefined);
  };

  const handleRake = () => {
    createRake.mutate({
      date: new Date().toISOString(),
      amount: rakeAmount ?? 0,
    });
    setRakeAmount(undefined);
  };

  const handleSaveDailyLimit = () => {
    const parsed = parseFloat(dailyLimitInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setDailyLimitPct(parsed);
    setDailyLimitInput("");
  };

  return {
    isLoading,
    amount,
    rakeAmount,
    deposits: user?.bank?.deposits ?? [],
    withdrawals: user?.bank?.withdrawals ?? [],
    rakes: user?.bank?.rakes ?? [],
    dailyLimitPct,
    dailyLimitInput,
    onAmountChange: setAmount,
    onRakeAmountChange: setRakeAmount,
    onDeposit: handleDeposit,
    onWithdrawal: handleWithdrawal,
    onRake: handleRake,
    onDailyLimitInputChange: setDailyLimitInput,
    onSaveDailyLimit: handleSaveDailyLimit,
  };
}
