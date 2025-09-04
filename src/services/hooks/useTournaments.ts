import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Tournament } from "./types";
import { toast } from "sonner";
import { useGetUser } from "./useGetUser";

export const useTournaments = (platform: string = "") => {
  const { refetch } = useGetUser();
  const getAllTournaments = useQuery({
    queryKey: ["tournaments", platform],
    queryFn: () => apiClient.get(API_ENDPOINTS.TOURNAMENTS.GET_ALL(platform)),
  });

  const createTournament = useMutation({
    mutationFn: (data: Tournament) =>
      apiClient.post(API_ENDPOINTS.TOURNAMENTS.CREATE, data),
    onSuccess: () => {
      getAllTournaments.refetch();
      refetch();
    },
    onError: () => {
      toast.error("Erro ao criar torneio");
    },
  });

  const deleteTournament = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(API_ENDPOINTS.TOURNAMENTS.DELETE(id)),
    onSuccess: () => {
      getAllTournaments.refetch();
      refetch();
      toast.success("Torneio deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar torneio");
    },
  });

  return {
    getAllTournaments,
    createTournament,
    deleteTournament,
  };
};
