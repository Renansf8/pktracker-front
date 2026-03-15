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
