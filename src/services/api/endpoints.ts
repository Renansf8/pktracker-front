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
    GET_ALL: (platform: string, page: number = 1, limit: number = 10, hasSecondDay?: boolean, name?: string) => {
      const params = new URLSearchParams();
      if (platform) params.append("platform", platform);
      if (name) params.append("name", name);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (hasSecondDay !== undefined) params.append("hasSecondDay", String(hasSecondDay));
      return `/tournaments?${params.toString()}`;
    },
    CREATE: "/tournaments",
    BULK: "/tournaments/bulk",
    DELETE: (id: string) => `/tournaments/${id}`,
    UPDATE: (id: string) => `/tournaments/${id}`,
  },
  SCHEDULES: {
    GET_ALL: (type?: string) =>
      type ? `/tournaments/schedules?type=${type}` : "/tournaments/schedules",
    CREATE: "/tournaments/schedules",
    UPDATE: (id: string) => `/tournaments/schedules/${id}`,
    DELETE: (id: string) => `/tournaments/schedules/${id}`,
    APPLY: (scheduleId: string) => {
      const timezoneOffset = new Date().getTimezoneOffset();
      return `/tournaments/apply-schedule?scheduleId=${scheduleId}&timezoneOffset=${timezoneOffset}`;
    },
    ITEMS: {
      GET_ALL: (scheduleId: string) =>
        `/tournaments/schedules/${scheduleId}/items`,
      CREATE: (scheduleId: string) =>
        `/tournaments/schedules/${scheduleId}/items`,
      UPDATE: (scheduleId: string, id: string) =>
        `/tournaments/schedules/${scheduleId}/items/${id}`,
      DELETE: (scheduleId: string, id: string) =>
        `/tournaments/schedules/${scheduleId}/items/${id}`,
    },
  },
  CURRENCIES: {
    GET_ALL: "https://api.fxratesapi.com/latest",
  },
  BANK: {
    CREATE_DEPOSIT: "/banks/deposits",
    CREATE_WITHDRAWAL: "/banks/withdrawals",
    CREATE_RAKE: "/banks/rakes",
    ME: "/banks/me",
  },
  STATS: {
    SUMMARY: "/stats/summary",
  },
} as const;
