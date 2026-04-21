/**
 * src/app/(protected)/layout.tsx
 * ---------------------------------------------------------------------------
 * Layout compartilhado pelas rotas autenticadas. Renderiza o NavBar no topo
 * e busca os dados do usuário no servidor antes do HTML chegar no browser.
 *
 * Por que Server Component?
 *   - Conseguimos chamar `serverFetch("/users/me")` usando o cookie
 *     diretamente — sem passar por /api/proxy.
 *   - A NavBar já chega renderizada com nome/email do usuário (zero flicker
 *     de "Carregando..." na primeira pintura).
 *   - Se o fetch falhar por token inválido (401), limpamos a sessão e
 *     redirecionamos para /signin.
 *
 * O middleware JÁ garantiu que o usuário tem um cookie de auth. Este layout
 * cuida do caso em que o cookie existe mas o token é inválido/expirado
 * (o backend responde 401).
 */
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { serverFetch, ServerFetchError } from "@/lib/api/server";
import { clearSession } from "@/lib/auth/session";
import type { User } from "@/services/api/types";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: User | null = null;

  try {
    user = await serverFetch<User>("/users/me");
  } catch (err) {
    // Token expirado ou inválido — limpa cookie e manda pro login.
    if (err instanceof ServerFetchError && err.status === 401) {
      await clearSession();
      redirect("/signin");
    }
    // Outros erros (backend offline, 500) — propaga para `error.tsx`
    // desta rota ou do root.
    throw err;
  }

  return (
    <>
      <NavBar user={user} />
      <main>{children}</main>
    </>
  );
}
