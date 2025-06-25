export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Generic API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
