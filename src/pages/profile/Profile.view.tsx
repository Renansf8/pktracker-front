import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProfileViewProps } from "./profile.types";

function formatCurrency(value: number) {
  return `$ ${value.toFixed(2)}`;
}

export function ProfileView({
  isLoading,
  name,
  email,
  bankBalance,
  totalDeposit,
  totalWithdrawal,
  profit,
}: ProfileViewProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md bg-background text-text-primary border-input-border">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription className="text-text-secondary">
            Dados da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-secondary">Nome</p>
            <p className="text-text-primary text-base">{name || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-secondary">Email</p>
            <p className="text-text-primary text-base">{email || "—"}</p>
          </div>
          <div className="border-t border-input-border pt-4 mt-2 space-y-3">
            <p className="text-sm font-medium text-text-secondary">Banca</p>
            <div className="space-y-1">
              <p className="text-text-primary text-base font-semibold">
                {formatCurrency(bankBalance)}
              </p>
              <p className="text-xs text-text-secondary">
                Total depositado: {formatCurrency(totalDeposit)} · Total sacado:{" "}
                {formatCurrency(totalWithdrawal)}
              </p>
              <p
                className={`text-sm font-medium ${
                  profit >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                Lucro: {formatCurrency(profit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
