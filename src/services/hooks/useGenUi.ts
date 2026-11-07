import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  CommentaryRequest,
  CommentaryResponse,
  GeneratedDashboard,
} from "./genui.types";

const FALLBACK_ERROR = "Não foi possível gerar o dashboard. Tente novamente.";
export const COMMENTARY_FALLBACK_ERROR = "Não foi possível gerar o comentário. Tente novamente.";

export function getGenUiErrorMessage(error: unknown, fallback: string = FALLBACK_ERROR): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (Array.isArray(message) && typeof message[0] === "string" && message[0]) return message[0];
  }
  return fallback;
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

  const generateCommentary = useMutation({
    mutationFn: async ({ spec, prompt }: CommentaryRequest) => {
      const response = await apiClient.post<CommentaryResponse>(
        API_ENDPOINTS.GENUI.COMMENTARY,
        prompt ? { spec, prompt } : { spec },
      );
      return response.data;
    },
  });

  return { generateDashboard, generateCommentary };
};
