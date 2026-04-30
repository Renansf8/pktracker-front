/**
 * src/app/providers.tsx
 * ---------------------------------------------------------------------------
 * Client-side providers agrupados em um único arquivo.
 *
 * Por que separar este arquivo do `layout.tsx`?
 *   - `layout.tsx` é Server Component (pode usar `cookies()`, fetch server, etc).
 *   - Providers como QueryClientProvider precisam de "use client" porque usam
 *     React Context e estado interno.
 *   - Em vez de "contaminar" o layout inteiro com "use client", criamos este
 *     arquivo fino e importamos no layout — a fronteira fica bem delimitada.
 *
 * Substitui o antigo `src/providers/QueryProvider.tsx` + `Toaster` do App.tsx.
 */
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";

// Devtools só em dev. `lazy` evita que o pacote entre no bundle de produção.
const ReactQueryDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : lazy(() =>
        import("@tanstack/react-query-devtools").then((m) => ({
          default: m.ReactQueryDevtools,
        })),
      );

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors closeButton />
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
