import { useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Deposit, Withdrawal } from "./types";
import { apiClient } from "../api/client";
import { toast } from "sonner";
import { useGetUser } from "./useGetUser";

export const useBank = () => {
  const { refetch } = useGetUser();
  const createDeposit = useMutation({
    mutationFn: (data: Deposit) =>
      apiClient.post(API_ENDPOINTS.BANK.CREATE_DEPOSIT, data),
    onSuccess: () => {
      toast.success("Depósito criado com sucesso");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao criar depósito");
    },
  });

  const createWithdrawal = useMutation({
    mutationFn: (data: Withdrawal) =>
      apiClient.post(API_ENDPOINTS.BANK.CREATE_WITHDRAWAL, data),
    onSuccess: () => {
      toast.success("Saque criado com sucesso");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao criar saque");
    },
  });

  return {
    createDeposit,
    createWithdrawal,
  };
};
