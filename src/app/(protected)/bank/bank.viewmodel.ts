"use client";

import { useBank } from "@/services/hooks/useBank";
import { useGetUser } from "@/services/hooks/useGetUser";
import { useMemo, useState } from "react";
import { useDailyBuyInLimit } from "@/utils/useDailyBuyInLimit";
import type {
  BankDeposit,
  BankMonthlyStats,
  BankRake,
  BankViewProps,
  BankWithdrawal,
  BankYearTotals,
} from "./bank.types";

function isInMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(dateStr);
  return (
    !Number.isNaN(d.getTime()) &&
    d.getFullYear() === year &&
    d.getMonth() === month
  );
}

function sum(items: { amount: number }[]): number {
  return items.reduce((acc, item) => acc + Number(item.amount), 0);
}

export function useBankViewModel(): BankViewProps {
  const [amount, setAmount] = useState("");
  const [rakeAmount, setRakeAmount] = useState("");
  const [rakePlatform, setRakePlatform] = useState("");
  const [dailyLimitInput, setDailyLimitInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    () => new Date().getFullYear(),
  );
  const { data: user, isLoading } = useGetUser();
  const { createDeposit, createWithdrawal, createRake } = useBank();
  const { limitPct: dailyLimitPct, setLimitPct: setDailyLimitPct } =
    useDailyBuyInLimit();

  const deposits: BankDeposit[] = useMemo(
    () => user?.bank?.deposits ?? [],
    [user?.bank?.deposits],
  );
  const withdrawals: BankWithdrawal[] = useMemo(
    () => user?.bank?.withdrawals ?? [],
    [user?.bank?.withdrawals],
  );
  const rakes: BankRake[] = useMemo(
    () => user?.bank?.rakes ?? [],
    [user?.bank?.rakes],
  );

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const entry of [...deposits, ...withdrawals, ...rakes]) {
      const d = new Date(entry.date);
      if (!Number.isNaN(d.getTime())) years.add(d.getFullYear());
    }
    const sorted = [...years].sort((a, b) => b - a);
    if (!sorted.length) sorted.push(new Date().getFullYear());
    return sorted;
  }, [deposits, withdrawals, rakes]);

  const months = useMemo<BankMonthlyStats[]>(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const monthDeposits = deposits.filter((d) =>
        isInMonth(d.date, selectedYear, month),
      );
      const monthWithdrawals = withdrawals.filter((w) =>
        isInMonth(w.date, selectedYear, month),
      );
      const monthRakes = rakes.filter((r) =>
        isInMonth(r.date, selectedYear, month),
      );

      const depositsTotal = sum(monthDeposits);
      const withdrawalsTotal = sum(monthWithdrawals);
      const rakeTotal = sum(monthRakes);

      return {
        year: selectedYear,
        month,
        deposits: depositsTotal,
        withdrawals: withdrawalsTotal,
        rake: rakeTotal,
        depositCount: monthDeposits.length,
        withdrawalCount: monthWithdrawals.length,
        rakeCount: monthRakes.length,
        net: depositsTotal - withdrawalsTotal,
      };
    });
  }, [deposits, withdrawals, rakes, selectedYear]);

  const yearTotals = useMemo<BankYearTotals>(() => {
    const totalDeposits = months.reduce((acc, m) => acc + m.deposits, 0);
    const totalWithdrawals = months.reduce((acc, m) => acc + m.withdrawals, 0);
    const totalRake = months.reduce((acc, m) => acc + m.rake, 0);
    return {
      deposits: totalDeposits,
      withdrawals: totalWithdrawals,
      rake: totalRake,
      net: totalDeposits - totalWithdrawals,
    };
  }, [months]);

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
    deposits,
    withdrawals,
    rakes,
    dailyLimitPct,
    dailyLimitInput,
    rakePlatform,
    months,
    yearTotals,
    selectedYear,
    availableYears,
    onAmountChange: (v: string) => setAmount(v),
    onRakeAmountChange: (v: string) => setRakeAmount(v),
    onRakePlatformChange: (v: string) => setRakePlatform(v),
    onDeposit: handleDeposit,
    onWithdrawal: handleWithdrawal,
    onRake: handleRake,
    onDailyLimitInputChange: setDailyLimitInput,
    onSaveDailyLimit: handleSaveDailyLimit,
    onYearChange: setSelectedYear,
  };
}
