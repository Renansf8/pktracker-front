import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type { User } from "../api/types";

export const useGetUser = () => {
  return useQuery<User, Error>({
    // Good practice to type the expected data and error
    queryKey: ["user"],
    queryFn: async () => {
      const user = await apiClient.get<User>(API_ENDPOINTS.USERS.ME);
      if (!user) {
        throw new Error("No user data received");
      }
      return user.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
