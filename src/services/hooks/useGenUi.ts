import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { GeneratedDashboard } from "./genui.types";

const FALLBACK_ERROR = "Não foi possível gerar o dashboard. Tente novamente.";

export function getGenUiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
  }
  return FALLBACK_ERROR;
}

export const useGenUi = () => {
  const generateDashboard = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiClient.post<GeneratedDashboard>(
        API_ENDPOINTS.GENUI.DASHBOARD,
        { prompt },
      );
      return response.data;
    },
  });

  return { generateDashboard };
};
