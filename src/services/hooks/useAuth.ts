import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
// import { authQueryKeys } from '../queries/auth';
import type {
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
} from "../api/types";

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

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (loginData: LoginRequest) => {
      const rawResponse = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData
      );
      return rawResponse.data; // { accessToken }
    },
    onSuccess: (data) => {
      login(data.accessToken); // Store token
    },
  });
};
