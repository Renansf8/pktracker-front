export interface User {
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

// Generic API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
