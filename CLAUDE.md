# CLAUDE.md — pktracker-front

Guia de contexto do projeto para o Claude (e para novos devs). Mantenha este arquivo atualizado quando convenções, stack ou arquitetura mudarem.

---

## 1. Visão geral do projeto

`pktracker-front` é o frontend de uma aplicação para acompanhamento de resultados de torneios de poker (bankroll, estatísticas, calendário de torneios, etc.).

Estado atual (pós-migração, abril 2026):
- **Next.js 15+ com App Router** (SSR + Server Components).
- React 19 + TypeScript.
- Autenticação via **cookie httpOnly + middleware**.
- Server Components por padrão, Client Components onde houver interatividade.
- Tailwind v4 via `@tailwindcss/postcss`.
- Sentry via `@sentry/nextjs`.
- **Padrão arquitetural MVVM mantido** (ver seção 3).

Histórico: o projeto nasceu em Vite 6 SPA com `react-router` v7 e auth via
`localStorage`. A migração foi feita in-place na branch `feat/migrate-to-next`
em 7 fases (ver seção 9).

---

## 2. Stack final (pós-migração)

| Categoria | Biblioteca |
|---|---|
| Framework | `next` (App Router) |
| UI | `react`, `react-dom` v19 |
| Estilo | `tailwindcss` v4 + `@tailwindcss/postcss`, `tw-animate-css` |
| Componentes | shadcn/ui, `@radix-ui/*`, `@headlessui/react`, `@tremor/react` |
| Ícones | `lucide-react`, `@remixicon/react` |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` |
| Dados (client) | `@tanstack/react-query` |
| Dados (server) | `fetch` nativo + Server Actions |
| HTTP client | `axios` (apenas via `/api/proxy/*` no client) |
| Datas | `date-fns`, `react-day-picker` |
| Notificações | `sonner` |
| Charts | `recharts`, `@tremor/react` |
| Modais | `@radix-ui/react-dialog` (substitui `react-modal` por compatibilidade SSR) |
| Tema | `next-themes` |
| Observabilidade | `@sentry/nextjs` |
| Validação | `zod` |
| Utilitários | `clsx`, `tailwind-merge`, `class-variance-authority` |

---

## 3. Arquitetura MVVM em Next.js

O projeto usa **MVVM** e essa convenção **não muda** com a migração. O que muda é como acomodamos o padrão dentro da divisão Server/Client Components do App Router.

### 3.1. Estrutura por página

Cada rota tem 4 a 5 arquivos colocados na pasta da rota:

```
src/app/(protected)/tournaments/
  page.tsx                     ← Entry point do Next (Server Component por padrão)
  Tournaments.view.tsx         ← View ("use client" se houver interação)
  tournaments.viewmodel.ts     ← ViewModel (custom hook client-side)
  tournaments.types.ts         ← Types + zod schemas (compartilhados server/client)
  actions.ts                   ← Server Actions (mutations) — opcional
```

### 3.2. Responsabilidade de cada arquivo

- **`page.tsx`** (Server Component, sem `"use client"`):
  - Faz data fetching server-side via `serverFetch()` quando aplicável.
  - Lê `searchParams`, `params`.
  - Faz checks de autorização (a autenticação já é garantida pelo middleware).
  - Renderiza a View, passando dados iniciais como prop.
  - Substitui o antigo `index.tsx` que instanciava o ViewModel direto.

- **`[Page].view.tsx`** (geralmente `"use client"`):
  - Componente de apresentação puro.
  - Recebe props do ViewModel (e/ou dados iniciais do `page.tsx`).
  - Não faz fetch direto, não conhece a Server Action.

- **`[page].viewmodel.ts`** (custom hook client-side):
  - Estado, handlers, integração com `react-hook-form`, TanStack Query, `useFormState`.
  - É quem "chama" Server Actions ou hooks de query.
  - Retorna um objeto que vira `props` da View.

- **`[page].types.ts`**:
  - Types do domínio da página, schemas zod de formulários e DTOs.
  - Pode ser importado tanto no servidor quanto no cliente.

- **`actions.ts`** (`"use server"`):
  - Mutations executadas no servidor.
  - Substitui parte dos antigos hooks `useMutation` que faziam `POST/PUT/DELETE`.
  - Acessa `cookies()` diretamente para autenticação.

### 3.3. Quando o ViewModel virou Server Action?

Antes (Vite/SPA):
```ts
// signin.viewmodel.ts (tudo client-side)
const { mutate: login } = useLogin();         // hook que chama axios
const onSubmit = (data) => login(data, { onSuccess: () => navigate("/") });
```

Depois (Next):
```ts
// actions.ts ("use server")
export async function signInAction(prev, formData) {
  const res = await fetch(`${API}/auth/signin`, { ... });
  if (!res.ok) return { error: "Credenciais inválidas" };
  await setSessionToken((await res.json()).accessToken);
  redirect("/");
}

// signin.viewmodel.ts ("use client")
const [state, formAction] = useFormState(signInAction, { error: null });
const form = useForm({ resolver: zodResolver(signInSchema) });
return { form, formAction, state };
```

A View entrega o formulário com `<form action={formAction}>`. O ViewModel continua existindo, mas agora coordena `useFormState` + `react-hook-form` em vez de chamar `axios` direto.

### 3.4. Quando NÃO usar ViewModel separado

Se a página é puramente de leitura, sem interação (ex: uma tela de detalhes que só renderiza dados vindos do server), o `page.tsx` pode renderizar a View diretamente sem ViewModel. **MVVM é uma ferramenta, não uma obrigação.**

---

## 4. Estrutura de pastas (target)

```
pktracker-front/
├── src/
│   ├── app/                          ← App Router
│   │   ├── layout.tsx                ← Root layout (html, body, fonts, metadata)
│   │   ├── providers.tsx             ← "use client": QueryProvider + Toaster
│   │   ├── (auth)/                   ← Route group sem proteção
│   │   │   ├── layout.tsx
│   │   │   ├── signin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── SignIn.view.tsx
│   │   │   │   ├── signin.viewmodel.ts
│   │   │   │   ├── signin.types.ts
│   │   │   │   └── actions.ts
│   │   │   └── signup/
│   │   │       └── ... (mesma estrutura)
│   │   ├── (protected)/              ← Route group com NavBar
│   │   │   ├── layout.tsx            ← Server Component, busca user
│   │   │   ├── page.tsx              ← Home (rota /)
│   │   │   ├── Home.view.tsx
│   │   │   ├── home.viewmodel.ts
│   │   │   ├── home.types.ts
│   │   │   ├── tournaments/...
│   │   │   ├── bank/...
│   │   │   ├── stats/...
│   │   │   ├── schedule/...
│   │   │   └── profile/...
│   │   └── api/
│   │       └── proxy/
│   │           └── [...path]/route.ts ← Repassa requests do client com cookie
│   ├── components/                   ← Componentes compartilhados (NavBar, ui/, etc.)
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── session.ts            ← getSessionToken / setSessionToken / clearSession
│   │   │   └── actions.ts            ← signInAction / signUpAction / signOutAction
│   │   └── api/
│   │       ├── server.ts             ← serverFetch() para Server Components
│   │       ├── client.ts             ← axios apontando para /api/proxy
│   │       ├── endpoints.ts          ← (continua igual)
│   │       └── types.ts              ← (continua igual)
│   ├── services/                     ← Hooks de dados (TanStack Query)
│   │   └── hooks/                    ← useTournaments, useBank, etc.
│   ├── utils/                        ← (continua igual)
│   └── middleware.ts                 ← Proteção de rotas
├── public/
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── components.json                   ← shadcn config (continua)
├── eslint.config.js                  ← inclui eslint-config-next
├── sentry.client.config.ts
├── sentry.server.config.ts
└── package.json
```

### 4.1. Path alias

`@/*` continua mapeado para `./src/*`. Imports não mudam.

---

## 5. Autenticação

### 5.1. Modelo

Token JWT do backend → cookie `auth_token` httpOnly, secure, sameSite=lax, maxAge 7 dias.

### 5.2. Pontos de leitura/escrita

| Onde | Como |
|---|---|
| Server Component | `await getSessionToken()` (lê via `cookies()`) |
| Server Action | `await setSessionToken(token)` ou `await clearSession()` |
| Middleware | `req.cookies.get("auth_token")` |
| Route Handler `/api/proxy` | `cookies().get("auth_token")` e injeta `Authorization` |
| Client Component | **nunca acessa o token diretamente**. Faz request para `/api/proxy/...` que injeta o header. |

### 5.3. Proteção de rotas

`src/middleware.ts` cuida de tudo. Não existe mais `<ProtectedRoute>` ou `<PublicRoute>`. A divisão é por route group (`(auth)` x `(protected)`), e o middleware verifica o cookie.

### 5.4. O que NÃO usar

- `localStorage` para token (vulnerável a XSS, não funciona com SSR).
- `useAuth()` antigo do `AuthContext` — **removido** na fase 7.
- Componentes wrapper de proteção (`<ProtectedRoute>`) — **removido** na fase 7.

---

## 6. Variáveis de ambiente

| Antes (Vite) | Depois (Next) |
|---|---|
| `VITE_API_BASE_URL` | `API_BASE_URL` (server-only) e/ou `NEXT_PUBLIC_API_BASE_URL` (client) |
| `VITE_SENTRY_DSN` | `NEXT_PUBLIC_SENTRY_DSN` |
| `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` ou `process.env.*` |

Regra: **só prefixe `NEXT_PUBLIC_` se a variável precisa estar disponível no navegador.** Tudo que for usado apenas em Server Components, Server Actions ou Route Handlers deve ficar sem prefixo (mais seguro).

---

## 7. Convenções de código

### 7.1. Server vs Client Components

- **Default = Server Component.** Só adicione `"use client"` quando precisar de hooks, event handlers, estado, ou APIs do navegador.
- ViewModels são sempre client-side (são hooks).
- Views podem ser server ou client — depende se há interação.

### 7.2. Naming

- Pastas de rota: `kebab-case` ou `lowercase` (ex: `tournaments`, `signin`).
- Arquivos View: `PascalCase.view.tsx` (ex: `SignIn.view.tsx`).
- Arquivos ViewModel: `camelCase.viewmodel.ts`.
- Arquivos types: `camelCase.types.ts`.
- Arquivos actions: `actions.ts` (sempre singular dentro da pasta da rota).
- Componentes compartilhados: `PascalCase.tsx` em `src/components/`.

### 7.3. Data fetching

- **Listagem inicial** → `page.tsx` faz `serverFetch()` e passa via prop. Hidrata o cache do TanStack Query se necessário (`HydrationBoundary`).
- **Mutations** → Server Actions em `actions.ts`. Após mutar, chamar `revalidatePath()` ou `revalidateTag()`.
- **Refetch interativo no client** → continua usando TanStack Query através do `apiClient` (que aponta para `/api/proxy`).

### 7.4. Forms

- `react-hook-form` + `zod` (`zodResolver`) — convenção mantida.
- Para enviar ao servidor: `<form action={formAction}>` onde `formAction` vem de `useFormState(serverAction, initialState)`.
- Validação client-side com zod continua para feedback rápido.
- Validação server-side **também** deve rodar dentro da Server Action (nunca confiar só no client).

### 7.5. Tratamento de erros

- Server Actions retornam `{ error?: string }` em vez de lançar exceções para erros de negócio.
- Erros inesperados sobem para `error.tsx` da rota (criar quando necessário).
- `loading.tsx` substitui o `<Suspense fallback={<PageLoader />}>` global do react-router.

---

## 8. Bibliotecas a evitar / substituir

| Biblioteca | Status | Substituição |
|---|---|---|
| `react-router` | Remover | App Router nativo |
| `react-modal` | Substituir | `@radix-ui/react-dialog` (já instalado via shadcn) |
| `@sentry/react` | Substituir | `@sentry/nextjs` |
| `@vitejs/plugin-react`, `vite`, `@tailwindcss/vite` | Remover | (Next + `@tailwindcss/postcss`) |
| `eslint-plugin-react-refresh` | Remover | `eslint-config-next` |

---

## 9. Plano de migração (histórico)

Migração concluída em 2026-04-18. Fases executadas:

1. ✅ **Preparar terreno** — branch dedicada, commit do estado Vite.
2. ✅ **Setup Next** — remover Vite, atualizar `package.json`, criar `next.config.ts`, `postcss.config.mjs`, env vars, Sentry via `@sentry/nextjs`.
3. ✅ **Autenticação** — `session.ts` (cookie httpOnly via `cookies()`), Server Actions (`signInAction`, `signUpAction`, `signOutAction`), `middleware.ts`, route handler `/api/proxy/[...path]`.
4. ✅ **Layout e providers** — `app/layout.tsx` (Server), `app/providers.tsx` (`"use client"` — `QueryClientProvider` + `Toaster`), route groups `(auth)` e `(protected)` com seus `layout.tsx`, `NavBar` movido para `src/components`.
5. ✅ **Página exemplo** — `/signin` com `useActionState` + `react-hook-form` + zod, comentada em detalhe como referência.
6. ✅ **Páginas restantes** — signup, home, profile, bank, schedule, tournaments, stats — todas seguindo o template MVVM (`page.tsx` server + `.view.tsx` client + `.viewmodel.ts` + `.types.ts`).
7. ✅ **Verificação e limpeza** — removidos `src/pages/`, `src/router/`, `src/providers/`, `src/contexts/`, `src/App.tsx`, `src/components/ProtectedRoute.tsx`, `src/services/hooks/useAuth.ts`. Três modais migrados de `react-modal` para Radix Dialog. Shared components marcados com `"use client"` onde usam hooks.

### 9.1. Verificação local (o que rodar depois de `git pull`)

```bash
npm install            # instala next, @radix-ui/react-dialog, etc.
npm run lint           # ESLint com eslint-config-next
npm run build          # next build (também faz type-check)
npm run dev            # next dev na porta 3000
```

Se `npm run build` passar, a migração está funcional ponta a ponta.

---

## 10. Comandos úteis

```bash
npm run dev      # next dev (porta 3000)
npm run build    # next build
npm run start    # next start (após build)
npm run lint     # next lint
```

---

## 11. Decisões registradas

| Data | Decisão | Justificativa |
|---|---|---|
| 2026-04-17 | Migrar para Next.js App Router | Aprender Next, ganhar SSR, melhor SEO em rotas públicas |
| 2026-04-17 | Migração in-place na branch `feat/migrate-to-next` | Manter mesmo repo, deletar Vite progressivamente |
| 2026-04-17 | Auth via cookie httpOnly + middleware | Idiomático no Next, mais seguro que localStorage |
| 2026-04-17 | Manter MVVM como padrão arquitetural | Já é a convenção do projeto, faz sentido para separar testes/responsabilidades |
| 2026-04-17 | App Router (não Pages) | Padrão atual do Next, ensina Server Components |
| 2026-04-17 | Substituir `react-modal` por Radix Dialog | Compatibilidade com SSR |
| 2026-04-18 | Server Actions só para `/signin` e `/signup` | Demais mutations (bank, schedule, tournaments) continuam via TanStack Query + `/api/proxy` — feedback otimista e loading/error UI mais simples no client |
| 2026-04-18 | View importa o ViewModel diretamente (em vez de `page.tsx` passar props) | `page.tsx` é Server Component e não invoca hooks. A View (`"use client"`) chama `useFooViewModel()` e distribui o estado nos filhos. MVVM continua preservado, a fronteira server/client apenas muda o local da instanciação. |
| 2026-04-18 | `useActionState` (React 19) em vez de `useFormState` | React 19 renomeou; retorna `[state, formAction, isPending]` útil para desabilitar botões. |

---

## 12. Para Claude/agentes futuros

- **Antes de criar uma página nova**, siga o template MVVM: `page.tsx` (entry/server), `Foo.view.tsx` (view, normalmente `"use client"`), `foo.viewmodel.ts` (hook), `foo.types.ts` (zod + types), `actions.ts` (Server Actions se houver mutations que precisem rodar no servidor — p.ex. auth).
- **A View chama `useFooViewModel()` internamente.** O `page.tsx` (server) não pode invocar hooks.
- **Nunca exponha o token de auth no client.** Sempre via cookie httpOnly + `/api/proxy`.
- **Nunca importe `localStorage` em código de auth.**
- **Nunca use `react-router` em código novo.** Use `next/navigation` (`useRouter`, `redirect`, `usePathname`).
- **Nunca use `react-modal`.** Use `@/components/ui/dialog` (Radix).
- **Nunca use `import.meta.env`.** Use `process.env.NEXT_PUBLIC_*` ou `process.env.*`.
- **Use `"use client"` em componentes que:** usam hooks (`useState`, `useMemo`, TanStack Query, etc.), bibliotecas browser-only (`recharts`, `@tremor/react`, `react-day-picker`), event handlers (`onClick`, `onChange`), ou portals. Em caso de dúvida, marque — o custo é baixo.
- Quando for criar Client Components que fazem fetch inicial, prefira passar dados via prop do `page.tsx` (Server Component com `serverFetch`) em vez de fazer fetch no client.
- **Respeite as Rules of Hooks.** Qualquer `useState`/`useMemo` na View deve vir ANTES de early returns (`if (isLoading) return <Loader />`).
- Atualize a seção 11 (Decisões registradas) sempre que tomar uma decisão arquitetural relevante.
