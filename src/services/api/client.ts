import axios, { type AxiosInstance, type AxiosResponse } from "axios";

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor for auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("auth_token");
        // window.location.href = "/signin";
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Create the client instance
const apiClient = createApiClient();

// Export the raw client if needed for advanced use cases
export { apiClient };
