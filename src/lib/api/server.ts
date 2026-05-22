import { getSessionToken } from "@/lib/auth/session";

export type ServerFetchOptions = RequestInit & {
  auth?: boolean;
};

export class ServerFetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ServerFetchError";
  }
}

const API_URL = process.env.API_BASE_URL;

export async function serverFetch<T = unknown>(
  path: string,
  { auth = true, headers, ...init }: ServerFetchOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("API_BASE_URL não definido no ambiente");
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const token = auth ? await getSessionToken() : undefined;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },

    cache: init.cache ?? "no-store",
  });

  if (!res.ok) {
    throw new ServerFetchError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
