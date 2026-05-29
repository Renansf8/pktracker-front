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

  const hasRevalidate = (init as { next?: { revalidate?: unknown } }).next?.revalidate !== undefined;

  const requestInit: RequestInit = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(hasRevalidate ? {} : { cache: init.cache ?? "no-store" }),
  };

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, requestInit);

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = res.headers.get("Retry-After");
      const waitMs = retryAfter
        ? parseFloat(retryAfter) * 1000
        : 1000 * 2 ** attempt;
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    if (!res.ok) {
      throw new ServerFetchError(
        `Request failed: ${res.status} ${res.statusText}`,
        res.status,
      );
    }

    if (res.status === 204) return undefined as T;

    return (await res.json()) as T;
  }

  throw new ServerFetchError("Request failed: 429 Too Many Requests", 429);
}
