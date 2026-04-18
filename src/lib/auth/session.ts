/**
 * src/lib/auth/session.ts
 * ---------------------------------------------------------------------------
 * Helpers de sessão do lado do servidor.
 *
 * O token JWT vindo do backend (pktracker-api) é guardado em um cookie
 * HTTP-ONLY. Isso significa que:
 *
 *   1. O JavaScript do navegador NÃO consegue ler esse cookie. Isso elimina
 *      o vetor principal de XSS (um script malicioso injetado não consegue
 *      roubar o token como acontecia com localStorage).
 *
 *   2. O cookie é enviado automaticamente em toda request para o mesmo domínio,
 *      o que permite que tanto Server Components (via `cookies()`) quanto
 *      nossas Route Handlers (em /api/proxy) leiam o token para autenticar
 *      chamadas ao backend.
 *
 * IMPORTANTE: estas funções só podem ser chamadas em contextos SERVER:
 *   - Server Components (arquivos `page.tsx` / `layout.tsx` sem "use client")
 *   - Server Actions (funções com "use server")
 *   - Route Handlers (arquivos `route.ts`)
 *
 * Tentar importar `cookies` de `next/headers` em um Client Component faz o
 * build explodir — e isso é intencional: Client Components NUNCA devem
 * acessar o cookie diretamente.
 */
import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

// 7 dias em segundos. Ajuste conforme a política de sessão do backend.
// O backend ainda tem o controle final: mesmo que o cookie esteja válido,
// se o JWT expirar o servidor devolve 401 e nós deslogamos o usuário.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Lê o token atual do cookie. Retorna `undefined` se o usuário não estiver
 * logado ou se o cookie não existir.
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Salva o token no cookie com as flags de segurança apropriadas.
 *
 *   - httpOnly:  bloqueia acesso via document.cookie no JS do browser.
 *   - secure:    só é enviado em HTTPS. Desligado em dev (NODE_ENV !== production).
 *   - sameSite:  "lax" impede CSRF em navegações top-level mantendo links comuns.
 *   - path:      "/" disponibiliza em toda a aplicação.
 *   - maxAge:    tempo em segundos até o cookie expirar no browser.
 */
export async function setSessionToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Remove o cookie (logout). Após chamar isso, a próxima request passará pelo
 * middleware sem token e será redirecionada para /signin.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Nome do cookie exportado para uso em middleware.ts, onde usamos
 * `req.cookies.get(...)` em vez de `next/headers`. Centralizar a string aqui
 * evita inconsistências.
 */
export const SESSION_COOKIE_NAME = COOKIE_NAME;
