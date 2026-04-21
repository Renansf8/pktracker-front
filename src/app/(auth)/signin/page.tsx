/**
 * src/app/(auth)/signin/page.tsx
 * ---------------------------------------------------------------------------
 * Entry point da rota /signin no App Router.
 *
 * ## O que muda em relação ao Vite?
 *
 * No Vite, tínhamos `src/pages/signin/index.tsx` que instanciava o ViewModel
 * direto e passava as props pra View. Aqui, a "página" é um Server Component
 * que só delega pra View — o ViewModel é invocado DENTRO da View (que é
 * Client Component).
 *
 * Por que o page.tsx existe como Server Component se ele não faz nada?
 *   - É o contrato do App Router: para existir a rota `/signin`, tem que
 *     existir `app/(auth)/signin/page.tsx` com default export.
 *   - Fica preparado para, no futuro, ler `searchParams` (ex.: `?from=/bank`
 *     para mostrar um toast "Faça login para acessar essa página"), sem ter
 *     que marcar tudo como "use client".
 *   - Ainda cabe meta (título, og:image) e outras coisas só-servidor sem
 *     "contaminar" a View com esse conhecimento.
 *
 * ## Metadata
 *
 * O export `metadata` é lido pelo Next no build e na primeira render. Vai
 * substituir o antigo `<Helmet>` ou alterações diretas no <title>. Aqui
 * customizamos só o título; o description/og herda do root layout.
 */
import type { Metadata } from "next";
import { SignInView } from "./SignIn.view";

export const metadata: Metadata = {
  title: "Entrar — PkTracker",
};

export default function SignInPage() {
  return <SignInView />;
}
