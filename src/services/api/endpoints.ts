export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/signin",
    REGISTER: "/auth/signup",
    LOGOUT: "/auth/signout",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE: "/users/profile",
    DELETE: "/users/profile",
    ME: "/users/me",
  },
  TOURNAMENTS: {
    GET_ALL: (platform: string) => `/tournaments?platform=${platform}`,
    CREATE: "/tournaments",
    DELETE: (id: string) => `/tournaments/${id}`,
  },
  CURRENCIES: {
    GET_ALL: "https://api.fxratesapi.com/latest",
  },
} as const;
