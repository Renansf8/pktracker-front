/**
 * src/lib/auth/actions.ts
 * ---------------------------------------------------------------------------
 * Server Actions compartilhadas de autenticação.
 *
 * Uma "Server Action" é uma função com a diretiva "use server" que pode ser
 * importada e chamada diretamente de Client Components — mas na execução
 * roda EXCLUSIVAMENTE no servidor. O Next intercepta a chamada, serializa os
 * argumentos, executa no servidor e devolve o resultado.
 *
 * Isso substitui o antigo padrão:
 *     useMutation({ mutationFn: (data) => apiClient.post(...) })
 *     .onSuccess(() => navigate("/"))
 *
 * Em vez disso, a página faz:
 *     <form action={signInAction}>...</form>
 * e o próprio Next se encarrega de serializar o FormData, rodar a action no
 * servidor, e (se houver redirect ou revalidate) aplicar os efeitos na
 * resposta.
 *
 * Vantagens sobre useMutation + axios:
 *   1. O segredo (token) nunca sai do servidor — o browser nem vê a URL do
 *      backend.
 *   2. Revalidação automática via `revalidatePath` / `revalidateTag`.
 *   3. Funciona mesmo sem JavaScript (progressive enhancement).
 */
"use server";

import { redirect } from "next/navigation";
import { setSessionToken, clearSession } from "./session";

/**
 * Formato do estado devolvido pelas actions. O `useActionState` (React 19)
 * — anteriormente `useFormState` (React 18) — espera que a action receba o
 * estado anterior como primeiro argumento e devolva o novo estado.
 */
export type AuthFormState = {
  error?: string;
};

const API_URL = process.env.API_BASE_URL;

/**
 * Valida credenciais no backend e grava o token no cookie httpOnly.
 *
 * Uso: `<form action={signInAction}>` + `useActionState(signInAction, ...)`.
 *
 * - Se der certo: seta cookie e redireciona pra "/". O `redirect()` no
 *   Next faz throw de um símbolo especial que quebra a action (por isso não
 *   tem `return` depois dele).
 * - Se der errado: devolve `{ error }`. A View mostra a mensagem ao usuário.
 */
export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Formulário inválido" };
  }

  try {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      // Importante: fetch no server por padrão faz cache. Para chamadas de
      // autenticação queremos sempre ir até o backend.
      cache: "no-store",
    });

    if (!res.ok) {
      // O backend devolve 401/400 para credenciais inválidas. Evitamos
      // expor o corpo da resposta ao usuário para não vazar informações.
      return { error: "Email ou senha inválidos" };
    }

    const data = (await res.json()) as { accessToken: string };
    if (!data.accessToken) {
      return { error: "Resposta do servidor sem token" };
    }

    await setSessionToken(data.accessToken);
  } catch (err) {
    // Erros de rede, backend offline, etc.
    console.error("[signInAction] unexpected error:", err);
    return { error: "Falha ao conectar com o servidor" };
  }

  // redirect() lança internamente — precisa ficar FORA do try/catch para não
  // ser capturado como erro. Por isso está aqui embaixo.
  redirect("/");
}

/**
 * Cria conta nova no backend. Mesma estrutura da signInAction.
 *
 * O backend atual (pela leitura de types.ts) devolve `{ accessToken }` no
 * signup — então já logamos o usuário direto. Se um dia o backend passar
 * a exigir verificação de email antes, mudamos aqui.
 */
export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = formData.get("name");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof name !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { error: "Formulário inválido" };
  }

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lastName, email, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      // Backend pode devolver 409 (email já cadastrado), 400 (dados inválidos)
      // etc. Tentamos propagar a mensagem do backend quando existir.
      const payload = (await res.json().catch(() => null)) as
        | { message?: string }
        | null;
      return { error: payload?.message ?? "Não foi possível criar a conta" };
    }

    const data = (await res.json()) as { accessToken?: string };
    if (data.accessToken) {
      await setSessionToken(data.accessToken);
    }
  } catch (err) {
    console.error("[signUpAction] unexpected error:", err);
    return { error: "Falha ao conectar com o servidor" };
  }

  redirect("/");
}

/**
 * Logout: remove o cookie e manda pro /signin.
 *
 * Essa action pode ser chamada direto de um `<form action={signOutAction}>`
 * dentro de um botão, ou via `<button formAction={signOutAction}>` dentro
 * de um form maior.
 */
export async function signOutAction(): Promise<void> {
  await clearSession();
  redirect("/signin");
}
