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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { platforms } from "@/utils/platforms";

export function BankView() {
  const {
    isLoading,
    amount,
    rakeAmount,
    rakePlatform,
    deposits,
    withdrawals,
    rakes,
    dailyLimitPct,
    dailyLimitInput,
    onAmountChange,
    onRakeAmountChange,
    onRakePlatformChange,
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

  const totalDeposits = deposits.reduce((acc, d) => acc + Number(d.amount), 0);
  const totalWithdrawals = withdrawals.reduce((acc, w) => acc + Number(w.amount), 0);
  const totalRake = rakes.reduce((acc, r) => acc + Number(r.amount), 0);

  return (
    <div className="flex flex-col items-center w-[90%] mx-auto mt-8 text-text-primary gap-6 mb-12">

      {/* Configurações */}
      <div className="glass-panel flex flex-col gap-4 w-[80%] rounded-3xl p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
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
            disabled={
              !dailyLimitInput ||
              Number.isNaN(parseFloat(dailyLimitInput)) ||
              parseFloat(dailyLimitInput) <= 0
            }
          >
            Salvar
          </Button>
        </div>
      </div>

      {/* Ações */}
      <div className="glass-panel flex flex-col gap-5 w-[80%] rounded-3xl p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          Ações
        </p>

        <div className="flex items-center gap-3">
          <Input
            className="w-32"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
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
        </div>

        <div
          className="flex items-center gap-3 pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Input
            className="w-32"
            placeholder="0.00"
            value={rakeAmount}
            onChange={(e) => onRakeAmountChange(e.target.value)}
          />
          <Select value={rakePlatform} onValueChange={onRakePlatformChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            className="bg-[#7c3aed] text-white font-bold"
            disabled={!rakeAmount}
            onClick={onRake}
          >
            Rake
          </Button>
        </div>
      </div>

      {/* Registros */}
      <div className="glass-panel flex gap-8 w-[80%] items-start rounded-3xl p-8 mb-4">

        {/* Depósitos */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              Depósitos
            </p>
            <span className="font-data text-sm font-semibold" style={{ color: "var(--primary)" }}>
              $ {totalDeposits.toFixed(2)}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">Data</TableHead>
                <TableHead className="text-text-primary text-center">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.slice(-10).map((deposit: BankDeposit) => (
                <TableRow key={deposit.id ?? deposit.date}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(deposit.date)}
                  </TableCell>
                  <TableCell className="text-center font-data text-sm font-medium" style={{ color: "var(--primary)" }}>
                    $ {Number(deposit.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {deposits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-text-secondary text-xs py-6">
                    Nenhum depósito registrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Saques */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              Saques
            </p>
            <span className="font-data text-sm font-semibold text-green-400">
              $ {totalWithdrawals.toFixed(2)}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">Data</TableHead>
                <TableHead className="text-text-primary text-center">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.slice(-10).map((withdrawal: BankWithdrawal) => (
                <TableRow key={withdrawal.id ?? withdrawal.date}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(withdrawal.date)}
                  </TableCell>
                  <TableCell className="text-center font-data text-sm font-medium text-green-400">
                    $ {Number(withdrawal.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-text-secondary text-xs py-6">
                    Nenhum saque registrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Rake */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              Rake
            </p>
            <span className="font-data text-sm font-semibold text-purple-400">
              $ {totalRake.toFixed(2)}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">Data</TableHead>
                <TableHead className="text-text-primary text-center">Plataforma</TableHead>
                <TableHead className="text-text-primary text-center">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rakes.slice(-10).map((rake: BankRake) => (
                <TableRow key={rake.id ?? rake.date}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(rake.date)}
                  </TableCell>
                  <TableCell className="text-text-primary text-center">
                    {rake.platform ?? "—"}
                  </TableCell>
                  <TableCell className="text-center font-data text-sm font-medium text-purple-400">
                    $ {Number(rake.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {rakes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-text-secondary text-xs py-6">
                    Nenhum rake registrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}
