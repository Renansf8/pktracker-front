# MIGRATION_PLAN.md — Vite → Next.js (App Router)

Documento operacional da migração. Para contexto e convenções, ver `CLAUDE.md`.

> **Branch:** `feat/migrate-to-next`
> **Estratégia:** in-place, mantendo `src/components/`, `src/utils/`, `src/services/api/endpoints.ts`, `src/services/api/types.ts`, `src/services/hooks/*` (com pequenos ajustes de import) e `src/index.css` quase intactos.

---

## Inventário (FASE 1)

### Arquivos que serão DELETADOS

| Arquivo | Motivo |
|---|---|
| `vite.config.ts` | Substituído por `next.config.ts` |
| `index.html` (raiz) | Next gera HTML via `app/layout.tsx` + `metadata` |
| `src/main.tsx` | Substituído pelo entry implícito do Next (`app/layout.tsx`) |
| `src/vite-env.d.ts` | Substituído por `next-env.d.ts` (gerado pelo Next) |
| `src/App.tsx` | Roteamento agora é file-based; layout vai pra `app/layout.tsx` |
| `src/router/routes.tsx` | App Router substitui completamente |
| `src/contexts/AuthContext.tsx` | Auth vira cookie + middleware |
| `src/components/ProtectedRoute.tsx` | `middleware.ts` cuida disso |
| `tsconfig.app.json` | Next usa um único `tsconfig.json` |
| `tsconfig.node.json` | Idem |
| `public/vite.svg` | Substituir por favicon próprio (ou remover do `metadata`) |

### Arquivos que serão MODIFICADOS

| Arquivo | Tipo de mudança |
|---|---|
| `package.json` | Trocar deps (remover Vite, adicionar Next) e scripts |
| `tsconfig.json` | Reescrever completo no padrão Next |
| `eslint.config.js` | Adicionar `eslint-config-next` |
| `.env` | `VITE_*` → `NEXT_PUBLIC_*` ou sem prefixo |
| `components.json` | `"rsc": false` → `"rsc": true` |
| `src/services/api/client.ts` | Apontar pra `/api/proxy`, remover leitura de `localStorage` |
| `src/providers/QueryProvider.tsx` | Adicionar `"use client"`, trocar `import.meta.env.PROD` por `process.env.NODE_ENV` |
| `src/services/hooks/useAuth.ts` | Substituir por Server Actions (será deletado e recriado) |
| `src/components/NavBar.tsx` | Trocar `<Link>` do react-router por `next/link`, `useLocation` por `usePathname` |

### Arquivos que continuam INTACTOS

- `src/components/ui/*` (shadcn — exceto setar `rsc: true` em `components.json`)
- `src/components/ActivityCard.tsx`, `PlayerSuggestions.tsx`, `ResultsProfitCharts.tsx`, `Summarize Cards.tsx`, `SummarizeResults.tsx`
- `src/utils/*`
- `src/lib/utils.ts`
- `src/lib/query-client.ts`
- `src/services/api/endpoints.ts`
- `src/services/api/types.ts`
- `src/services/hooks/useTournaments.ts`, `useBank.ts`, `useStats.ts`, `useSchedule.ts`, `useGetUser.ts`, `useCurrency.ts` (só ajustar imports do apiClient se necessário)
- `src/index.css`

### Arquivos que serão CRIADOS

```
next.config.ts
postcss.config.mjs
next-env.d.ts                         (gerado pelo Next)
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
src/middleware.ts
src/lib/auth/session.ts
src/lib/auth/actions.ts
src/lib/api/server.ts
src/app/layout.tsx
src/app/providers.tsx
src/app/globals.css                   (mover/renomear src/index.css)
src/app/api/proxy/[...path]/route.ts
src/app/(auth)/layout.tsx
src/app/(auth)/signin/page.tsx
src/app/(auth)/signin/SignIn.view.tsx
src/app/(auth)/signin/signin.viewmodel.ts
src/app/(auth)/signin/signin.types.ts
src/app/(auth)/signin/actions.ts
src/app/(auth)/signup/...             (mesma estrutura)
src/app/(protected)/layout.tsx
src/app/(protected)/page.tsx          (home)
src/app/(protected)/Home.view.tsx
src/app/(protected)/home.viewmodel.ts
src/app/(protected)/home.types.ts
src/app/(protected)/tournaments/...
src/app/(protected)/bank/...
src/app/(protected)/stats/...
src/app/(protected)/schedule/...
src/app/(protected)/profile/...
```

---

## FASE 1 — Preparar terreno

**Status:** ✅ Branch `feat/migrate-to-next` já criada por Renan. Inventário completo (ver acima).

**Saídas desta fase:**
- `CLAUDE.md` na raiz (criado).
- `MIGRATION_PLAN.md` na raiz (este arquivo).
- Tabelas de "deletar/modificar/criar" acima servem de checklist de sanidade.

**Critério de pronto:** ✅ Branch criada e dois documentos no repo.

---

## FASE 2 — Setup do Next.js

Objetivo: trocar o "motor" do projeto. No final desta fase, `npm run dev` abre o Next em `localhost:3000` e renderiza pelo menos um "Hello World" usando os componentes existentes.

### 2.1. Deletar arquivos do Vite

```bash
rm vite.config.ts index.html src/main.tsx src/vite-env.d.ts \
   tsconfig.app.json tsconfig.node.json public/vite.svg
```

### 2.2. Atualizar `package.json`

**Remover:**

```
@vitejs/plugin-react
vite
@tailwindcss/vite
eslint-plugin-react-refresh
```

**Adicionar:**

```
next                       (^15.0.0)
eslint-config-next         (^15.0.0)
@tailwindcss/postcss       (^4.1.10)
postcss                    (^8.4.0)
```

**Trocar:**

```
@sentry/react  →  @sentry/nextjs
```

**Scripts:**

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

Remover `"type": "module"` (Next gerencia isso por arquivo).

### 2.3. Criar configs base

**`next.config.ts`** (mínimo, Sentry adiciona depois):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

**`postcss.config.mjs`:**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**`tsconfig.json`** (substitui tudo):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2.4. Migrar variáveis de ambiente

`.env`:

```bash
# Server-only (mais seguro)
API_BASE_URL="http://localhost:3000"

# Client-side (precisa do prefixo)
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SENTRY_DSN="https://b7a69fc9..."
```

**Buscar e substituir em todo o código:**

```
import.meta.env.VITE_API_BASE_URL  →  process.env.NEXT_PUBLIC_API_BASE_URL
import.meta.env.VITE_SENTRY_DSN    →  process.env.NEXT_PUBLIC_SENTRY_DSN
import.meta.env.PROD               →  process.env.NODE_ENV === "production"
import.meta.env.DEV                →  process.env.NODE_ENV === "development"
```

Arquivos afetados conhecidos: `src/services/api/client.ts`, `src/providers/QueryProvider.tsx`.

### 2.5. Migrar Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

O wizard cria `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` e modifica `next.config.ts` (envolvendo no `withSentryConfig`). Apagar o trecho de inicialização do Sentry que estava no antigo `main.tsx` (já removido).

### 2.6. Atualizar ESLint

Substituir `eslint.config.js` pelo padrão do Next:

```js
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

### 2.7. shadcn/ui

Em `components.json`, mudar `"rsc": false` para `"rsc": true`. Isso faz o `npx shadcn add` gerar componentes com `"use client"` quando necessário.

**Critério de pronto:** `npm run dev` sobe o Next. Build não quebra. Não precisa ter páginas funcionando ainda.

---

## FASE 3 — Autenticação

Objetivo: substituir `AuthContext` + `localStorage` por cookie httpOnly + middleware + Server Actions.

### 3.1. `src/lib/auth/session.ts`

Helpers para ler/escrever o cookie de sessão. **Só funciona em Server Components, Server Actions e Route Handlers.**

```ts
import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function setSessionToken(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}
```

### 3.2. `src/lib/auth/actions.ts`

Server Actions de auth. **Substituem `useLogin` e `useRegister` antigos.**

```ts
"use server";

import { redirect } from "next/navigation";
import { setSessionToken, clearSession } from "./session";

type FormState = { error?: string };

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const res = await fetch(`${process.env.API_BASE_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return { error: "Credenciais inválidas" };

  const { accessToken } = await res.json();
  await setSessionToken(accessToken);
  redirect("/");
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  // mesma ideia, chamando /auth/signup
}

export async function signOutAction() {
  await clearSession();
  redirect("/signin");
}
```

### 3.3. `src/middleware.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/signin", "/signup"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 3.4. `src/lib/api/server.ts`

`fetch` autenticado para Server Components.

```ts
import { getSessionToken } from "@/lib/auth/session";

export async function serverFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getSessionToken();
  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
```

### 3.5. Refatorar `src/services/api/client.ts`

Apontar para `/api/proxy` (não mais para o backend direto). Remover request interceptor de `localStorage`.

```ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/proxy",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) window.location.href = "/signin";
    return Promise.reject(e);
  }
);

export { apiClient };
```

### 3.6. `src/app/api/proxy/[...path]/route.ts`

Route Handler que repassa requests do client adicionando o token do cookie.

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const token = await getSessionToken();
  const url = `${process.env.API_BASE_URL}/${path.join("/")}${req.nextUrl.search}`;

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
  });

  const data = await res.text();
  return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
```

**Critério de pronto:** middleware redireciona corretamente; cookie é setado no signin; `/api/proxy` repassa requests com header de auth.

---

## FASE 4 — Layout e providers

### 4.1. `src/app/layout.tsx` (root)

```tsx
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const syne = Syne({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "PkTracker",
  description: "Acompanhe seus resultados de torneios de poker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${jetbrains.variable} ${syne.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

`next/font` substitui o `<link>` do Google Fonts do antigo `index.html`.

### 4.2. `src/app/providers.tsx`

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors closeButton />
    </QueryClientProvider>
  );
}
```

ReactQueryDevtools pode entrar aqui também via `dynamic` import.

### 4.3. Route groups

Criar:

```
src/app/(auth)/layout.tsx          ← layout simples sem NavBar
src/app/(protected)/layout.tsx     ← layout com NavBar
```

`(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen flex items-center justify-center">{children}</main>;
}
```

`(protected)/layout.tsx` (Server Component, busca user):

```tsx
import { NavBar } from "@/components/NavBar";
import { serverFetch } from "@/lib/api/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await serverFetch<{ id: string; name: string; email: string }>("/users/me");
  return (
    <>
      <NavBar user={user} />
      <main>{children}</main>
    </>
  );
}
```

### 4.4. Adaptar `NavBar`

Trocar `import { Link, useLocation } from "react-router"` por `import Link from "next/link"; import { usePathname } from "next/navigation";`. Receber `user` por prop em vez de `useAuth()`.

**Critério de pronto:** `localhost:3000` mostra layout com NavBar quando logado, redireciona pra `/signin` quando não logado.

---

## FASE 5 — Página exemplo: signin

Migra `/signin` mantendo MVVM. Esta é a referência visual para você fazer as outras 7 páginas.

### Estrutura

```
src/app/(auth)/signin/
  page.tsx                ← entry (Server Component)
  SignIn.view.tsx         ← View ("use client")
  signin.viewmodel.ts     ← ViewModel hook
  signin.types.ts         ← types + zod
  actions.ts              ← Server Action
```

### `signin.types.ts` (idêntico ao atual)

```ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export type SignInViewProps = {
  form: ReturnType<typeof import("react-hook-form").useForm<SignInFormData>>;
  formAction: (formData: FormData) => void;
  state: { error?: string };
  isPending: boolean;
};
```

### `actions.ts`

Já mostrada na FASE 3. Pode estar em `src/lib/auth/actions.ts` (compartilhada) ou colocada em `src/app/(auth)/signin/actions.ts` (local). Recomendo **local**, pra cada rota ter suas Server Actions próximas.

### `signin.viewmodel.ts`

```ts
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInAction } from "./actions";
import { signInSchema, type SignInFormData, type SignInViewProps } from "./signin.types";

export function useSignInViewModel(): SignInViewProps {
  const [state, formAction] = useFormState(signInAction, { error: undefined });
  const { pending } = useFormStatus(); // só funciona dentro do form, mas serve de exemplo

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  return { form, formAction, state, isPending: pending };
}
```

### `SignIn.view.tsx`

```tsx
"use client";

import type { SignInViewProps } from "./signin.types";
// ... imports dos componentes shadcn

export function SignInView({ form, formAction, state }: SignInViewProps) {
  return (
    <form action={formAction} className="...">
      {/* inputs com {...form.register("email")} */}
      {state.error && <p className="text-red-500">{state.error}</p>}
      <button type="submit">Entrar</button>
    </form>
  );
}
```

### `page.tsx`

```tsx
import { SignInView } from "./SignIn.view";
import { useSignInViewModel } from "./signin.viewmodel";

// Mas atenção: page.tsx é Server Component por padrão.
// Como o ViewModel é hook (client), criamos um client wrapper:
import { SignInPage } from "./SignIn.view";  // ou um arquivo separado

export default function Page() {
  return <SignInPage />;
}
```

**Detalhe importante:** `page.tsx` não pode usar hooks. Por isso, ou:
- (a) Movemos a chamada do ViewModel pra dentro da própria View (`SignIn.view.tsx`), e o `page.tsx` só renderiza `<SignInView />`.
- (b) Criamos um `SignInClient.tsx` ("use client") que chama o ViewModel e renderiza a View, e o `page.tsx` (server) renderiza `<SignInClient />`.

A opção **(a)** é mais simples e mantém o "casamento" entre View e ViewModel sem arquivo extra. Vai ficar assim:

```tsx
// SignIn.view.tsx
"use client";
import { useSignInViewModel } from "./signin.viewmodel";

export function SignInView() {
  const { form, formAction, state } = useSignInViewModel();
  return <form action={formAction}>...</form>;
}

// page.tsx (Server Component, sem hooks)
import { SignInView } from "./SignIn.view";
export default function Page() { return <SignInView />; }
```

**Critério de pronto:** `/signin` funciona end-to-end. Login válido seta cookie e redireciona para `/`. Login inválido mostra erro retornado pela Server Action.

---

## FASE 6 — Páginas restantes (Renan)

Lista em ordem sugerida (mais fácil → mais difícil):

| # | Página | Por que essa ordem |
|---|---|---|
| 1 | `signup` | Gêmea do `signin` — copia o template e adapta |
| 2 | `profile` | CRUD simples, ensina `revalidatePath` |
| 3 | `bank` | Mais Server Actions (depósito/saque) |
| 4 | `schedule` | Listagem + filtros via `searchParams` |
| 5 | `tournaments` | Paginação + criação em massa |
| 6 | `stats` | Charts pesados (Tremor) — pode precisar `dynamic({ ssr: false })` |
| 7 | `home` | Composição de tudo, deixa por último |

**Template de cada página:**

```
src/app/(protected)/<nome>/
  page.tsx                  ← Server Component, faz serverFetch e passa props
  <Nome>.view.tsx           ← "use client", recebe props e chama useViewModel
  <nome>.viewmodel.ts       ← hook que coordena estado + Server Actions
  <nome>.types.ts           ← zod + types
  actions.ts                ← Server Actions de mutation (se houver)
```

**Padrão de data fetching:**

```tsx
// page.tsx
import { serverFetch } from "@/lib/api/server";
import { TournamentsView } from "./Tournaments.view";

export default async function Page({ searchParams }: { searchParams: Promise<{ platform?: string; page?: string }> }) {
  const { platform = "", page = "1" } = await searchParams;
  const initialData = await serverFetch(`/tournaments?platform=${platform}&page=${page}`);
  return <TournamentsView initialData={initialData} />;
}
```

A View hidrata o cache do TanStack Query com `initialData` e pode refetch no client a partir daí.

**Critério de pronto:** todas as 8 rotas funcionam, navegação entre elas funciona, dados carregam.

---

## FASE 7 — Verificação e doc final

### 7.1. Build e lint

```bash
npm run dev    # smoke test
npm run lint   # tem que passar
npm run build  # tem que passar
npm run start  # smoke test do bundle de produção
```

Erros típicos no `build` que **não** aparecem no `dev`:
- `useState` em Server Component → adicionar `"use client"`.
- `cookies()` chamado fora de Server Component → mover para Server Action.
- `import "..."` de pacote só client em Server Component → dynamic import com `ssr: false`.

### 7.2. Atualizar `CLAUDE.md`

Após a migração rodar, voltar no `CLAUDE.md` e:
- Marcar seção "Estado atual" como **concluído**.
- Anotar surpresas/aprendizados na seção 11 ("Decisões registradas").
- Atualizar a seção 9 ("Plano de migração") indicando que o plano foi executado.

### 7.3. Limpeza

- Apagar `src/contexts/AuthContext.tsx` se ainda existir.
- Apagar `src/components/ProtectedRoute.tsx`.
- Apagar `src/router/`.
- Apagar `src/App.tsx`.
- Apagar `src/services/hooks/useAuth.ts` (substituído por Server Actions).
- Apagar `src/providers/QueryProvider.tsx` (movido para `src/app/providers.tsx`).
- Verificar se `react-router` foi removido do `package.json`.

**Critério de pronto:** projeto roda em dev e produção, lint passa, repo limpo de código morto.

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Tremor charts quebram em SSR | `dynamic(() => import(...), { ssr: false })` |
| `react-modal` quebra hidratação | Trocar por `@radix-ui/react-dialog` (tarefa solo) |
| `localStorage` espalhado em outros lugares | Buscar `localStorage` no projeto inteiro, refatorar |
| Backend espera token no header e o proxy não passa | Validar no Network tab que `Authorization` chega |
| `useFormState` tem nome diferente em React 19 | É `useActionState` em React 19. Confirmar versão e ajustar |

> **Nota React 19:** O hook `useFormState` foi renomeado para `useActionState` em React 19. Se o projeto está em React 19, usar `useActionState` direto (importado de `react`, não de `react-dom`). Os exemplos acima mostram `useFormState` por familiaridade — substituir na hora de implementar.

---

## Mapa de "antes/depois" rápido

| Vite/React Router | Next.js App Router |
|---|---|
| `src/main.tsx` | `src/app/layout.tsx` |
| `src/App.tsx` + `<Router>` | `src/app/layout.tsx` + file-based routing |
| `<BrowserRouter>` + `<Routes>` | Pastas em `src/app/` |
| `useNavigate()` | `useRouter()` (client) ou `redirect()` (server) |
| `useLocation()` | `usePathname()` |
| `<Link to="/x">` (react-router) | `<Link href="/x">` (next/link) |
| `<ProtectedRoute>` | `middleware.ts` |
| `<PublicRoute>` | `middleware.ts` |
| `<Suspense fallback={<PageLoader />}>` | `loading.tsx` por rota |
| `lazy(() => import(...))` | Code-splitting automático por rota |
| `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` ou `process.env.*` |
| `localStorage.setItem("auth_token")` | `cookies().set("auth_token", ...)` em Server Action |
| `useMutation({ mutationFn })` (auth) | Server Action + `useActionState` |
| `axios.get(VITE_API/x)` no client | `axios.get("/api/proxy/x")` no client |
| Custom `index.html` `<head>` | `metadata` em `layout.tsx` |
| Google Fonts via `<link>` | `next/font/google` |
| `vite.config.ts manualChunks` | Code-splitting automático do Next |
