import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  ScheduleType,
  TournamentSchedule,
  TournamentScheduleItem,
} from "./schedule.types";
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

  const duplicateSchedule = useMutation({
    mutationFn: async ({
      sourceId,
      newName,
      type,
    }: {
      sourceId: string;
      newName: string;
      type: ScheduleType;
    }) => {
      const createRes = await apiClient.post(API_ENDPOINTS.SCHEDULES.CREATE, {
        name: newName,
        type,
      });
      const newSchedule = createRes.data?.data ?? createRes.data;
      const newId: string = newSchedule?.id;
      if (!newId) throw new Error("ID da nova grade não encontrado");

      const itemsRes = await apiClient.get(
        API_ENDPOINTS.SCHEDULES.ITEMS.GET_ALL(sourceId),
      );
      const raw = itemsRes.data;
      const items: TournamentScheduleItem[] = Array.isArray(raw)
        ? raw
        : (raw?.data ?? []);

      for (const item of items) {
        await apiClient.post(API_ENDPOINTS.SCHEDULES.ITEMS.CREATE(newId), {
          time: item.time,
          platform: item.platform,
          name: item.name,
          currency: item.currency,
          buyIn: item.buyIn,
        });
      }

      return { newId, copiedCount: items.length };
    },
    onSuccess: async ({ copiedCount }) => {
      await queryClient.refetchQueries({ queryKey: ["schedules"] });
      toast.success(
        `Grade duplicada com ${copiedCount} torneio${copiedCount !== 1 ? "s" : ""}`,
      );
    },
    onError: () => {
      toast.error("Erro ao duplicar grade");
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
    duplicateSchedule,
    deleteSchedule,
  };
};
