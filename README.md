# PkTracker — Frontend

Aplicação completa para acompanhamento de bankroll e torneios de poker, construída com **Next.js 15** e **React 19**.

Registre seus resultados, gerencie seu bankroll, planeje sua agenda e analise sua performance — tudo em um só lugar.

---

## Funcionalidades

- **Dashboard** — visão geral da atividade recente e métricas principais
- **Torneios** — cadastro e gerenciamento de resultados de torneios
- **Bankroll** — controle de depósitos, saques e saldo atual
- **Estatísticas** — gráficos e análises da sua performance
- **Agenda** — planejamento de torneios com visualização em calendário
- **Carreira** — acompanhamento da progressão de carreira a longo prazo
- **Analytics** — insights aprofundados e visualização de dados
- **Perfil** — gerenciamento das configurações da conta

---

## Stack

| Categoria | Biblioteca |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript |
| Estilo | Tailwind CSS v4 |
| Componentes | shadcn/ui, Radix UI, Tremor, Headless UI |
| Ícones | Lucide React, Remix Icon |
| Formulários | React Hook Form + Zod |
| Dados (client) | TanStack Query v5 |
| Gráficos | Recharts, Tremor |
| Datas | date-fns, React Day Picker |
| Notificações | Sonner |
| Observabilidade | Sentry |

---

## Arquitetura

O projeto segue o padrão **MVVM** (Model-View-ViewModel) adaptado para o App Router do Next.js.

Cada rota contém até 5 arquivos:

```
src/app/(protected)/tournaments/
  page.tsx                  # Server Component — data fetching, metadata
  Tournaments.view.tsx      # Client Component — apresentação
  tournaments.viewmodel.ts  # Custom hook — estado, handlers, queries
  tournaments.types.ts      # Schemas Zod + tipos TypeScript
  actions.ts                # Server Actions — mutations (quando necessário)
```

A **autenticação** é feita via cookie `httpOnly` + middleware do Next.js. O token nunca chega ao navegador — todas as requisições client-side passam por `/api/proxy/[...path]`, que injeta o header `Authorization` no servidor.

---

## Como rodar

### Pré-requisitos

- Node.js 20+
- Uma instância do [pktracker backend](https://github.com/Renansf8/pktracker-api) rodando *(ou aponte `API_BASE_URL` para uma instância remota)*

### Instalação

```bash
# Instalar dependências
npm install

# Copiar o arquivo de ambiente e preencher os valores
cp .env.example .env.local

# Iniciar o servidor de desenvolvimento (porta 3001)
npm run dev
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `API_BASE_URL` | URL base da API do backend (apenas server-side) |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do Sentry para rastreamento de erros (opcional) |

> `API_BASE_URL` é server-only — nunca use o prefixo `NEXT_PUBLIC_`.

---

## Scripts

```bash
npm run dev            # Servidor de desenvolvimento na porta 3001
npm run build          # Build de produção + type check
npm run start          # Servidor de produção (após o build)
npm run lint           # Rodar ESLint
npm run test           # Rodar testes unitários
npm run test:watch     # Testes em modo watch
npm run test:coverage  # Testes com relatório de cobertura
```

---

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/               # Rotas públicas (login, cadastro)
│   ├── (protected)/          # Rotas autenticadas (todas as páginas do app)
│   │   ├── page.tsx          # Dashboard
│   │   ├── tournaments/
│   │   ├── bank/
│   │   ├── stats/
│   │   ├── schedule/
│   │   ├── career/
│   │   ├── analytics/
│   │   └── profile/
│   ├── api/proxy/[...path]/  # Route handler do proxy de API
│   ├── layout.tsx            # Layout raiz
│   └── providers.tsx         # QueryClient + Toaster
├── components/               # Componentes compartilhados (NavBar, primitivos UI)
├── lib/
│   ├── auth/                 # Gerenciamento de sessão + Server Actions de auth
│   └── api/                  # serverFetch(), cliente axios, endpoints
├── services/hooks/           # Hooks TanStack Query (por domínio)
├── utils/                    # Funções utilitárias
└── middleware.ts             # Proteção de rotas
```

---

## Testes

Os testes unitários usam **Jest** + **React Testing Library** e ficam junto aos arquivos fonte em pastas `__tests__/`.

```bash
npm run test
npm run test:coverage
```

---

## Licença

MIT
