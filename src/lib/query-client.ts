import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      // Só 1 retry: com 3 retries o backoff exponencial adiciona ~7s extras de espera
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        if (error?.response?.status === 401) return false;
        return failureCount < 1;
      },
      // Delay fixo de 1s entre retries (evita backoff exponencial longo)
      retryDelay: 1000,
      // Não refazer requests ao voltar para a aba — evita requests surpresa
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
