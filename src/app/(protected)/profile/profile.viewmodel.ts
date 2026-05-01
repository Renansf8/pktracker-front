/**
 * src/app/(protected)/profile/profile.viewmodel.ts
 * ---------------------------------------------------------------------------
 * Sem mudanças em relação à versão SPA além do "use client" (necessário para
 * chamar o hook `useGetUser`).
 */
"use client";

import { useGetUser } from "@/services/hooks/useGetUser";
import { useCorrectedBank } from "@/services/hooks/useCorrectedBank";
import type { ProfileViewProps } from "./profile.types";

export function useProfileViewModel(): ProfileViewProps {
  const { data: user, isLoading } = useGetUser();
  const { bankUsd, totalWinnings } = useCorrectedBank();

  return {
    isLoading,
    name: user?.name ?? "",
    email: user?.email ?? "",
    bankBalance: bankUsd,
    totalDeposit: user?.bank?.totalDeposit ?? 0,
    totalWithdrawal: user?.bank?.totalWithdrawal ?? 0,
    profit: totalWinnings,
  };
}
