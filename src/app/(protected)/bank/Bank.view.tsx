"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { convertUsdToBrl } from "@/utils/currencyConvert";
import { useCurrency } from "@/services/hooks/useCurrency";
import { PlatformTag } from "@/components/PlatformTag";
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

const MONTH_SHORT = [
  "Jan", "Fev", "Mar", "Abr",
  "Mai", "Jun", "Jul", "Ago",
  "Set", "Out", "Nov", "Dez",
];

const FLOW_GOLD = "#d4a843";
const FLOW_SUCCESS = "#3db87a";
const FLOW_RAKE = "#a78bfa";
const FLOW_MUTED = "#a09488";
const FLOW_TICK = { fill: FLOW_MUTED, fontSize: 10 };

function latestFirst<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

type FlowTooltipPayload = ReadonlyArray<{
  value?: number | string | Array<number | string>;
  dataKey?: string | number;
  color?: string;
}>;

function FlowTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: FlowTooltipPayload;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(8,8,8,0.96)",
        border: "1px solid rgba(212,168,67,0.18)",
        padding: "8px 12px",
        borderRadius: "2px",
      }}
    >
      <p className="font-data text-[11px] mb-1" style={{ color: FLOW_MUTED }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="font-data text-xs font-semibold"
          style={{ color: entry.color }}
        >
          {entry.dataKey}: $ {Number(entry.value ?? 0).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export function BankView() {
  const { currencies } = useCurrency();
  const brlRate = currencies?.data?.rates?.BRL;
  const toBrl = (usd: number) =>
    brlRate !== undefined ? convertUsdToBrl(brlRate * usd) : null;

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
    months,
    yearTotals,
    selectedYear,
    availableYears,
    onAmountChange,
    onRakeAmountChange,
    onRakePlatformChange,
    onDeposit,
    onWithdrawal,
    onRake,
    onDailyLimitInputChange,
    onSaveDailyLimit,
    onYearChange,
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

  const flowChartData = months.map((m) => ({
    month: MONTH_SHORT[m.month],
    Depósitos: m.deposits,
    Saques: m.withdrawals,
    Rake: m.rake,
  }));
  const hasYearActivity =
    yearTotals.deposits > 0 || yearTotals.withdrawals > 0 || yearTotals.rake > 0;
  const yearIdx = availableYears.indexOf(selectedYear);
  const canGoPrevYear = yearIdx < availableYears.length - 1;
  const canGoNextYear = yearIdx > 0;
  const goPrevYear = () => {
    if (yearIdx < availableYears.length - 1) onYearChange(availableYears[yearIdx + 1]);
  };
  const goNextYear = () => {
    if (yearIdx > 0) onYearChange(availableYears[yearIdx - 1]);
  };

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

      {/* Fluxo mensal */}
      <div className="glass-panel flex flex-col gap-5 w-[80%] rounded-3xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            Fluxo mensal
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrevYear}
              disabled={!canGoPrevYear}
              className="flex items-center justify-center w-6 h-6 transition-colors duration-200 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
              style={{ border: "1px solid var(--pk-panel-top)", borderRadius: "2px" }}
            >
              <ChevronLeft size={12} style={{ color: "var(--primary)" }} />
            </button>
            <span className="font-display text-lg font-bold text-gold w-14 text-center tabular-nums">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={goNextYear}
              disabled={!canGoNextYear}
              className="flex items-center justify-center w-6 h-6 transition-colors duration-200 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed"
              style={{ border: "1px solid var(--pk-panel-top)", borderRadius: "2px" }}
            >
              <ChevronRight size={12} style={{ color: "var(--primary)" }} />
            </button>
          </div>
        </div>

        {/* Resumo anual */}
        <div className="glass-inner rounded-xl px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              {
                label: "Depositado",
                value: yearTotals.deposits,
                brl: toBrl(yearTotals.deposits),
                color: "var(--primary)",
              },
              {
                label: "Sacado",
                value: yearTotals.withdrawals,
                brl: toBrl(yearTotals.withdrawals),
                color: FLOW_SUCCESS,
              },
              {
                label: "Rake pago",
                value: yearTotals.rake,
                brl: toBrl(yearTotals.rake),
                color: FLOW_RAKE,
              },
              {
                label: "Fluxo líquido",
                value: yearTotals.net,
                brl: toBrl(yearTotals.net),
                color: yearTotals.net >= 0 ? FLOW_SUCCESS : "var(--destructive)",
              },
            ].map((item) => (
              <div key={item.label}>
                <p
                  className="text-[9px] uppercase tracking-[0.14em] mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {item.label}
                </p>
                <p
                  className="font-data text-sm font-semibold tabular-nums"
                  style={{ color: item.color }}
                >
                  {item.value < 0 ? "-" : ""}$ {Math.abs(item.value).toFixed(2)}
                </p>
                {item.brl && (
                  <p
                    className="font-data text-[10px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    ({item.brl})
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico */}
        <div className="glass-chart-surface rounded-2xl p-3 pt-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={flowChartData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              barGap={4}
              barCategoryGap="22%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(212,168,67,0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={FLOW_TICK}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={70}
                tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
                tick={FLOW_TICK}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={FlowTooltip}
                cursor={{ fill: "rgba(212,168,67,0.05)" }}
              />
              <Bar dataKey="Depósitos" fill={FLOW_GOLD} radius={[2, 2, 0, 0]} fillOpacity={0.85} />
              <Bar dataKey="Saques" fill={FLOW_SUCCESS} radius={[2, 2, 0, 0]} fillOpacity={0.85} />
              <Bar dataKey="Rake" fill={FLOW_RAKE} radius={[2, 2, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-5 justify-center mt-1">
            {[
              { label: "Depósitos", color: FLOW_GOLD },
              { label: "Saques", color: FLOW_SUCCESS },
              { label: "Rake", color: FLOW_RAKE },
            ].map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 font-data text-[10px] uppercase tracking-[0.12em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>

          {!hasYearActivity && (
            <p
              className="text-center font-data text-xs uppercase tracking-[0.1em] mt-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sem movimentações em {selectedYear}
            </p>
          )}
        </div>
      </div>

      {/* Registros */}
      <div className="glass-panel flex gap-8 w-[80%] items-start rounded-3xl p-8 mb-4">

        {/* Depósitos */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              Depósitos
            </p>
            <div className="flex flex-col items-end">
              <span className="font-data text-sm font-semibold" style={{ color: "var(--primary)" }}>
                $ {totalDeposits.toFixed(2)}
              </span>
              {toBrl(totalDeposits) && (
                <span className="font-data text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                  ({toBrl(totalDeposits)})
                </span>
              )}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">Data</TableHead>
                <TableHead className="text-text-primary text-center">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestFirst(deposits).slice(0, 10).map((deposit: BankDeposit) => (
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
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              Saques
            </p>
            <div className="flex flex-col items-end">
              <span className="font-data text-sm font-semibold text-green-400">
                $ {totalWithdrawals.toFixed(2)}
              </span>
              {toBrl(totalWithdrawals) && (
                <span className="font-data text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                  ({toBrl(totalWithdrawals)})
                </span>
              )}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-text-primary text-center">Data</TableHead>
                <TableHead className="text-text-primary text-center">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestFirst(withdrawals).slice(0, 10).map((withdrawal: BankWithdrawal) => (
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
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              Rake
            </p>
            <div className="flex flex-col items-end">
              <span className="font-data text-sm font-semibold text-purple-400">
                $ {totalRake.toFixed(2)}
              </span>
              {toBrl(totalRake) && (
                <span className="font-data text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                  ({toBrl(totalRake)})
                </span>
              )}
            </div>
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
              {latestFirst(rakes).slice(0, 10).map((rake: BankRake) => (
                <TableRow key={rake.id ?? rake.date}>
                  <TableCell className="text-text-primary text-center">
                    {convertIsoDateToBr(rake.date)}
                  </TableCell>
                  <TableCell className="text-center">
                    {rake.platform ? (
                      <PlatformTag platform={rake.platform} />
                    ) : (
                      "—"
                    )}
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
