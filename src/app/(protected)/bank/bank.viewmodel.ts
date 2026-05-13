"use client";

import { useBank } from "@/services/hooks/useBank";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useState } from "react";
import { useDailyBuyInLimit } from "@/utils/useDailyBuyInLimit";
import type { BankViewProps } from "./bank.types";

export function useBankViewModel(): BankViewProps {
  const [amount, setAmount] = useState("");
  const [rakeAmount, setRakeAmount] = useState("");
  const [rakePlatform, setRakePlatform] = useState("");
  const [dailyLimitInput, setDailyLimitInput] = useState("");
  const { data: user, isLoading } = useGetUser();
  const { createDeposit, createWithdrawal, createRake } = useBank();
  const { limitPct: dailyLimitPct, setLimitPct: setDailyLimitPct } =
    useDailyBuyInLimit();

  const parseAmount = (raw: string) => parseFloat(raw.replace(",", "."));

  const handleDeposit = () => {
    const parsed = parseAmount(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    createDeposit.mutate({ date: new Date().toISOString(), amount: parsed });
    setAmount("");
  };

  const handleWithdrawal = () => {
    const parsed = parseAmount(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    createWithdrawal.mutate({ date: new Date().toISOString(), amount: parsed });
    setAmount("");
  };

  const handleRake = () => {
    const parsed = parseAmount(rakeAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    createRake.mutate({
      date: new Date().toISOString(),
      amount: parsed,
      ...(rakePlatform.trim() && { platform: rakePlatform.trim() }),
    });
    setRakeAmount("");
    setRakePlatform("");
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
    rakePlatform,
    onAmountChange: (v: string) => setAmount(v),
    onRakeAmountChange: (v: string) => setRakeAmount(v),
    onRakePlatformChange: (v: string) => setRakePlatform(v),
    onDeposit: handleDeposit,
    onWithdrawal: handleWithdrawal,
    onRake: handleRake,
    onDailyLimitInputChange: setDailyLimitInput,
    onSaveDailyLimit: handleSaveDailyLimit,
  };
}
