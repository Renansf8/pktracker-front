import axios, { type AxiosInstance, type AxiosResponse } from "axios";

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: "/api/proxy",

    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
};

const apiClient = createApiClient();

export { apiClient };
