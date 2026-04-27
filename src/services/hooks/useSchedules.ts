import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { ScheduleType, TournamentSchedule } from "./schedule.types";
import { toast } from "sonner";

export const useSchedules = (type?: ScheduleType) => {
  const queryClient = useQueryClient();

  const getSchedules = useQuery({
    queryKey: ["schedules", type ?? "all"],
    queryFn: () => apiClient.get(API_ENDPOINTS.SCHEDULES.GET_ALL(type)),
  });

  const createSchedule = useMutation({
    mutationFn: (data: { name: string; type: ScheduleType }) =>
      apiClient.post(API_ENDPOINTS.SCHEDULES.CREATE, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["schedules"] });
      toast.success("Grade criada");
    },
    onError: () => {
      toast.error("Erro ao criar grade");
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(API_ENDPOINTS.SCHEDULES.DELETE(id)),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["schedules"] });
      toast.success("Grade removida");
    },
    onError: () => {
      toast.error("Erro ao remover grade");
    },
  });

  const schedules: TournamentSchedule[] = (() => {
    const raw = getSchedules.data?.data;
    return (Array.isArray(raw) ? raw : raw?.data ?? []) as TournamentSchedule[];
  })();

  return {
    getSchedules,
    schedules,
    createSchedule,
    deleteSchedule,
  };
};
