import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos

      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        if (error?.response?.status === 401) return false;
        return failureCount < 1;
      },

      retryDelay: 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
