import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { Tournament } from "./types";
import { toast } from "sonner";
import { useGetUser } from "./useGetUser";

export const useTournaments = () => {
  const { refetch } = useGetUser();
  const getAllTournaments = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => apiClient.get(API_ENDPOINTS.TOURNAMENTS.GET_ALL),
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

  return {
    getAllTournaments,
    createTournament,
  };
};
