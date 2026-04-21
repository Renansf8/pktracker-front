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
import type { BankViewProps } from "./bank.types";

export function useBankViewModel(): BankViewProps {
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const { data: user, isLoading } = useGetUser();
  const { createDeposit, createWithdrawal } = useBank();

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

  return {
    isLoading,
    amount,
    deposits: user?.bank?.deposits ?? [],
    withdrawals: user?.bank?.withdrawals ?? [],
    onAmountChange: setAmount,
    onDeposit: handleDeposit,
    onWithdrawal: handleWithdrawal,
  };
}
