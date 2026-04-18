/**
 * src/services/api/client.ts
 * ---------------------------------------------------------------------------
 * Axios client usado em CLIENT COMPONENTS (via TanStack Query, handlers
 * interativos, etc.). Aponta para `/api/proxy/*` — uma Route Handler nossa
 * que injeta o Authorization header lendo o cookie httpOnly.
 *
 * Por que esse "double hop" (browser → /api/proxy → backend)?
 *
 *   - O token não pode ficar acessível ao JavaScript do navegador
 *     (cookie httpOnly). Então o client não consegue montar o header
 *     `Authorization: Bearer <token>` sozinho.
 *
 *   - A Route Handler `/api/proxy/[...path]` roda no servidor, lê o cookie
 *     via `cookies()`, adiciona o header e repassa a chamada para o
 *     backend real.
 *
 *   - Resultado: do ponto de vista do client, é como se estivesse chamando
 *     o backend diretamente. O token nunca é exposto.
 *
 * Se você estiver em um Server Component, USE `serverFetch()` (de
 * `@/lib/api/server`) em vez deste cliente — mais rápido, sem o hop extra.
 */
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    // Sempre relativo: o browser manda para a mesma origin que serviu o HTML,
    // e o Next intercepta via Route Handler em /app/api/proxy.
    baseURL: "/api/proxy",
    // 60s para aguentar o cold start do Render no plano free
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Não precisamos mais de request interceptor para ler localStorage —
  // o cookie httpOnly é enviado automaticamente pelo browser em toda
  // request para o mesmo domínio (same-origin).

  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado ou inválido. Mandamos o usuário para o /signin.
        // O middleware vai limpar qualquer redirect em loop porque o
        // próprio /signin é rota pública.
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
