"use client";

import { useGetUser } from "@/services/hooks/useGetUser";
import type { ProfileViewProps } from "./profile.types";

export function useProfileViewModel(): ProfileViewProps {
  const { data: user, isLoading } = useGetUser();

  return {
    isLoading,
    name: user?.name ?? "",
    email: user?.email ?? "",
    bankBalance: user?.bank?.bank ?? 0,
    totalDeposit: user?.bank?.totalDeposit ?? 0,
    totalWithdrawal: user?.bank?.totalWithdrawal ?? 0,
    profit: (user?.bank?.profit ?? 0) + (user?.bank?.totalRake ?? 0),
  };
}
