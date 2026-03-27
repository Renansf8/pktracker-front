import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { ScheduleTournament } from "./schedule.types";
import { toast } from "sonner";

type UpdateScheduleInput = {
  id: string;
  data: Partial<Omit<ScheduleTournament, "id">>;
};

export const useSchedule = () => {
  const queryClient = useQueryClient();

  const getAllSchedule = useQuery({
    queryKey: ["schedule"],
    queryFn: () => apiClient.get(API_ENDPOINTS.SCHEDULE.GET_ALL),
  });

  const createSchedule = useMutation({
    mutationFn: (data: Omit<ScheduleTournament, "id">) =>
      apiClient.post(API_ENDPOINTS.SCHEDULE.CREATE, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["schedule"] });
      toast.success("Torneio adicionado na grade");
    },
    onError: () => {
      toast.error("Erro ao adicionar torneio na grade");
    },
  });

  const updateSchedule = useMutation({
    mutationFn: ({ id, data }: UpdateScheduleInput) =>
      apiClient.patch(API_ENDPOINTS.SCHEDULE.UPDATE(id), data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["schedule"] });
      toast.success("Torneio da grade atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar torneio da grade");
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.SCHEDULE.DELETE(id)),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["schedule"] });
      toast.success("Torneio removido da grade");
    },
    onError: () => {
      toast.error("Erro ao remover torneio da grade");
    },
  });

  return {
    getAllSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};

