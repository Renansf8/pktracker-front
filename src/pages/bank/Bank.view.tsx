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
import type { BankViewProps, BankDeposit, BankWithdrawal } from "./bank.types";

export function BankView({
  isLoading,
  amount,
  deposits,
  withdrawals,
  onAmountChange,
  onDeposit,
  onWithdrawal,
}: BankViewProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-[90%] mx-auto mt-8 text-text-primary gap-8">
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
          value={amount}
          onChange={(e) =>
            onAmountChange(
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
      </div>
    </div>
  );
}
