import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { PaginatedTournamentsResponse, StatsSummary } from "./types";

export const useStats = () => {
  const getStatsSummary = useQuery<AxiosResponse<StatsSummary>>({
    queryKey: ["stats", "summary"],
    queryFn: () => apiClient.get<StatsSummary>(API_ENDPOINTS.STATS.SUMMARY),
  });

  const getAllTournamentsForStats = useQuery<AxiosResponse<PaginatedTournamentsResponse>>({
    queryKey: ["stats", "platform-tournaments"],
    queryFn: () =>
      apiClient.get<PaginatedTournamentsResponse>(
        API_ENDPOINTS.TOURNAMENTS.GET_ALL({ limit: 9999 }),
      ),
  });

  return {
    getStatsSummary,
    getAllTournamentsForStats,
  };
};
