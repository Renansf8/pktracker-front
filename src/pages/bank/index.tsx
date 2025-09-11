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
import { useBank } from "@/services/hooks/useBank";
import { useGetUser } from "@/services/hooks/useGetUser";
import { convertIsoDateToBr } from "@/utils/dateConvert";
import { useState } from "react";

export const Bank = () => {
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const { data: user, isLoading } = useGetUser();
  const { createDeposit, createWithdrawal } = useBank();

  const handleCreateDeposit = () => {
    createDeposit.mutate({
      date: new Date().toISOString(),
      amount: amount || 0,
    });
    setAmount(undefined);
  };

  const handleCreateWithdrawal = () => {
    createWithdrawal.mutate({
      date: new Date().toISOString(),
      amount: amount || 0,
    });
    setAmount(undefined);
  };

  console.log("user", user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-[90%] mx-auto mt-8 text-text-primary gap-8">
      <div className="flex gap-4 w-[80%] items-center justify-center">
        <Button
          variant="outline"
          disabled={!amount}
          onClick={handleCreateDeposit}
        >
          Depósito
        </Button>
        <Button
          variant="secondary"
          className="bg-[#1fa700] text-text-primary font-bold"
          disabled={!amount}
          onClick={handleCreateWithdrawal}
        >
          Saque
        </Button>
        <Input
          className="w-[15%]"
          placeholder="R$ 0,00"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div className="flex gap-16 w-[80%] items-center justify-center border rounded-md p-4">
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
              {user?.bank.deposits.map((deposit) => (
                <TableRow>
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
              {user?.bank.withdrawals.map((withdrawal) => (
                <TableRow>
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
};
