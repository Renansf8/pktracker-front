import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
// import { authQueryKeys } from '../queries/auth';
import type { CreateUserRequest, LoginResponse } from "../api/types";

export const useRegister = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) =>
      apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, userData),
    // onSuccess: (data) => {
    //   localStorage.setItem('auth_token', data.token);
    //   queryClient.setQueryData(authQueryKeys.user(), data.user);
    // },
    onSuccess: (data) => {
      console.log(data);
    },
  });
};
