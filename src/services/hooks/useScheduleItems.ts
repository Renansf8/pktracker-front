import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { TournamentScheduleItem } from "./schedule.types";
import { toast } from "sonner";

type UpdateItemInput = {
  id: string;
  data: Partial<Omit<TournamentScheduleItem, "id" | "scheduleId">>;
};

export const useScheduleItems = (scheduleId: string | null) => {
  const queryClient = useQueryClient();

  const getItems = useQuery({
    queryKey: ["schedule-items", scheduleId],
    queryFn: () =>
      apiClient.get(API_ENDPOINTS.SCHEDULES.ITEMS.GET_ALL(scheduleId!)),
    enabled: !!scheduleId,
  });

  const createItem = useMutation({
    mutationFn: (
      data: Omit<TournamentScheduleItem, "id" | "scheduleId">,
    ) =>
      apiClient.post(API_ENDPOINTS.SCHEDULES.ITEMS.CREATE(scheduleId!), data),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["schedule-items", scheduleId],
      });
      toast.success("Torneio adicionado na grade");
    },
    onError: () => {
      toast.error("Erro ao adicionar torneio na grade");
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }: UpdateItemInput) =>
      apiClient.patch(
        API_ENDPOINTS.SCHEDULES.ITEMS.UPDATE(scheduleId!, id),
        data,
      ),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["schedule-items", scheduleId],
      });
      toast.success("Torneio da grade atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar torneio da grade");
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(
        API_ENDPOINTS.SCHEDULES.ITEMS.DELETE(scheduleId!, id),
      ),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["schedule-items", scheduleId],
      });
      toast.success("Torneio removido da grade");
    },
    onError: () => {
      toast.error("Erro ao remover torneio da grade");
    },
  });

  const items: TournamentScheduleItem[] = (() => {
    const raw = getItems.data?.data;
    return (Array.isArray(raw) ? raw : raw?.data ?? []) as TournamentScheduleItem[];
  })();

  return {
    getItems,
    items,
    createItem,
    updateItem,
    deleteItem,
  };
};
