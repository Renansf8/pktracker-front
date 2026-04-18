/**
 * src/lib/api/server.ts
 * ---------------------------------------------------------------------------
 * Helper para fazer requests autenticadas a partir de Server Components e
 * Server Actions. Usa o `fetch` nativo do Next (que tem integração com
 * revalidação e cache) em vez do axios.
 *
 * Uso típico em um page.tsx:
 *
 *   // app/(protected)/tournaments/page.tsx  (Server Component)
 *   import { serverFetch } from "@/lib/api/server";
 *
 *   export default async function Page() {
 *     const data = await serverFetch<TournamentsResponse>("/tournaments?page=1");
 *     return <TournamentsView initialData={data} />;
 *   }
 *
 * O token é injetado automaticamente lendo o cookie httpOnly — o caller
 * não precisa se preocupar com auth.
 */
import { getSessionToken } from "@/lib/auth/session";

/**
 * Options extras além das do `fetch` padrão:
 *   - `auth`: se `false`, pula a injeção do Authorization header.
 *             Útil para endpoints públicos (ex: fxratesapi externa).
 */
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

  // Se `path` já é uma URL absoluta, usa ela; caso contrário, concatena com
  // API_BASE_URL. Isso permite que o mesmo helper sirva endpoints externos
  // (ex: https://api.fxratesapi.com/latest) com `auth: false`.
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const token = auth ? await getSessionToken() : undefined;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    // Por padrão não cacheamos respostas autenticadas — elas dependem do
    // usuário logado. Páginas específicas podem passar `next: { revalidate }`
    // via `init` para habilitar cache controlado.
    cache: init.cache ?? "no-store",
  });

  if (!res.ok) {
    // 401 vindo do backend = token expirado ou inválido. O caller pode
    // tratar isso redirecionando para /signin; aqui só sinalizamos.
    throw new ServerFetchError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  // Algumas rotas podem devolver 204 sem body.
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
