import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Tournament } from "./types";
import { toast } from "sonner";
import { useGetUser } from "./useGetUser";

type UpdateTournamentInput = {
  id: string;
  data: Partial<Omit<Tournament, "id">>;
};

type BulkTournamentItem = Omit<Tournament, "id">;

export const useTournaments = (
  platform: string = "",
  page: number = 1,
  limit: number = 20,
  name: string = "",
) => {
  const queryClient = useQueryClient();
  const { refetch } = useGetUser();
  const getAllTournaments = useQuery({
    queryKey: ["tournaments", platform, page, limit, name],
    queryFn: () => apiClient.get(API_ENDPOINTS.TOURNAMENTS.GET_ALL(platform, page, limit, undefined, name)),
  });

  const getDay2Tournaments = useQuery({
    queryKey: ["tournaments", "day2"],
    queryFn: () => apiClient.get(API_ENDPOINTS.TOURNAMENTS.GET_ALL("", 1, 100, true)),
  });

  const createTournament = useMutation({
    mutationFn: (data: Tournament) =>
      apiClient.post(API_ENDPOINTS.TOURNAMENTS.CREATE, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["tournaments"] });
      refetch();
      toast.success("Torneio registrado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar torneio");
    },
  });

  const createManyTournaments = useMutation({
    mutationFn: async (tournaments: BulkTournamentItem[]) => {
      if (!tournaments.length) return;
      await apiClient.post(API_ENDPOINTS.TOURNAMENTS.BULK, {
        tournaments,
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["tournaments"] });
      refetch();
      toast.success("Grade adicionada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao adicionar grade");
    },
  });

  const deleteTournament = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(API_ENDPOINTS.TOURNAMENTS.DELETE(id)),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["tournaments"] });
      refetch();
      toast.success("Torneio deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar torneio");
    },
  });

  const updateTournament = useMutation({
    mutationFn: ({ id, data }: UpdateTournamentInput) =>
      apiClient.patch(API_ENDPOINTS.TOURNAMENTS.UPDATE(id), data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["tournaments"] });
      refetch();
      toast.success("Torneio atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar torneio");
    },
  });

  return {
    getAllTournaments,
    getDay2Tournaments,
    createTournament,
    createManyTournaments,
    deleteTournament,
    updateTournament,
  };
};
