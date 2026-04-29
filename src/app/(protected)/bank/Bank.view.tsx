"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { convertIsoDateToBr } from "@/utils/dateConvert";
import type { BankDeposit, BankRake, BankWithdrawal } from "./bank.types";
import { useBankViewModel } from "./bank.viewmodel";

export function BankView() {
  const {
    isLoading,
    amount,
    rakeAmount,
    deposits,
    withdrawals,
    rakes,
    dailyLimitPct,
    dailyLimitInput,
    onAmountChange,
    onRakeAmountChange,
    onDeposit,
    onWithdrawal,
    onRake,
    onDailyLimitInputChange,
    onSaveDailyLimit,
  } = useBankViewModel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="font-data text-sm tracking-[0.1em] uppercase text-text-secondary animate-pulse">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-[90%] mx-auto mt-8 text-text-primary gap-8">
      <div className="glass-panel flex flex-col gap-4 w-[80%] rounded-3xl p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-text-secondary">
          Configurações
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-text-primary">
            Limite diário de buy-ins:
          </span>
          <span className="text-sm font-semibold text-cyan-300">
            {dailyLimitPct.toFixed(0)}% da banca
          </span>
          <span className="text-xs text-text-secondary">
            (aviso a partir de {(dailyLimitPct * 0.85).toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={100}
            step={0.5}
            placeholder={`${dailyLimitPct}`}
            value={dailyLimitInput}
            onChange={(e) => onDailyLimitInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSaveDailyLimit()}
            className="w-24"
          />
          <span className="text-sm text-text-secondary">%</span>
          <Button
            variant="outline"
            onClick={onSaveDailyLimit}
            disabled={!dailyLimitInput || Number.isNaN(parseFloat(dailyLimitInput)) || parseFloat(dailyLimitInput) <= 0}
          >
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex gap-4 w-[80%] items-center justify-center">
        <Button variant="outline" disabled={!amount} onClick={onDeposit}>
          Depósito
        </Button>
        <Button
          variant="secondary"
          className="bg-[#1fa700] text-text-primary font-bold"
          disabled={!amount}
          onClick={onWithdrawal}
        >
          Saque
        </Button>
        <Input
          className="w-[15%]"
          placeholder="R$ 0,00"
          value={amount ?? ""}
          onChange={(e) =>
            onAmountChange(
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
        />
      </div>
      <div className="flex gap-4 w-[80%] items-center justify-center">
        <Button
          variant="secondary"
          className="bg-[#7c3aed] text-white font-bold"
          disabled={!rakeAmount}
          onClick={onRake}
        >
          Rake
        </Button>
        <Input
          className="w-[15%]"
          placeholder="R$ 0,00"
          value={rakeAmount ?? ""}
          onChange={(e) =>
            onRakeAmountChange(
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
        />
      </div>

      <div className="glass-panel flex gap-16 w-[80%] items-center justify-center rounded-3xl p-8">
        <div className="flex flex-col gap-4 w-[30%]">
          <p>Registros de depósitos</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">
                  Data
                </TableHead>
                <TableHead className="text-text-primary text-center">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((deposit: BankDeposit) => (
                <TableRow key={deposit.id ?? deposit.date}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(deposit.date)}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    $ {Number(deposit.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-4 w-[30%]">
          <p>Registros de saques</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">
                  Data
                </TableHead>
                <TableHead className="text-text-primary text-center">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal: BankWithdrawal) => (
                <TableRow key={withdrawal.id ?? withdrawal.date}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(withdrawal.date)}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    $ {Number(withdrawal.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-4 w-[30%]">
          <p>Registros de rake</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">
                  Data
                </TableHead>
                <TableHead className="text-text-primary text-center">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rakes.map((rake: BankRake) => (
                <TableRow key={rake.id ?? rake.date}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(rake.date)}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    $ {Number(rake.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
