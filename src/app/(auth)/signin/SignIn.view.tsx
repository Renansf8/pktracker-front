/**
 * src/app/(auth)/signin/SignIn.view.tsx
 * ---------------------------------------------------------------------------
 * View da rota /signin.
 *
 * ## Responsabilidade
 * Renderização pura. Recebe tudo via prop do ViewModel. Não conhece a
 * Server Action diretamente, não acessa cookies, não faz fetch.
 *
 * ## Mudanças em relação à versão SPA
 *
 *   - `import { Link } from "react-router"`  →  `import Link from "next/link"`
 *     (prop `href` em vez de `to`).
 *   - `onSubmit={form.handleSubmit(onSubmit)}` continua igual, mas agora
 *     o handler manda pra Server Action em vez de chamar axios.
 *   - Exibimos o erro server-side (`state.error`) logo abaixo do título:
 *     é o erro que a action devolve quando credenciais são inválidas.
 *   - Botão desabilitado enquanto `isPending` — evita double-submit.
 *
 * ## Por que a View chama o ViewModel aqui dentro (e não no page.tsx)?
 *
 * No padrão "canônico" (o que a gente usava no Vite) a hierarquia era:
 *    page.tsx  →  instancia ViewModel  →  passa props pra View.
 *
 * Como o `page.tsx` agora é Server Component, ele não pode invocar hooks
 * (useForm, useActionState etc.). Duas opções:
 *
 *   (a) Criar um wrapper Client Component que chama o hook e passa pra
 *       View. Gera um arquivo extra só pra isso.
 *
 *   (b) A própria View ser Client Component e chamar o ViewModel dentro.
 *       Mais prático e não fere o MVVM — a View continua sendo só
 *       apresentação; a lógica está toda no hook.
 *
 * Escolhemos (b) para manter o número de arquivos baixo. Em páginas onde
 * a View precisa ser 100% "burra" (ex.: testes de snapshot sem mockar
 * hooks), você pode usar (a).
 */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormMessage,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useSignInViewModel } from "./signin.viewmodel";

export function SignInView() {
  // Ver comentário no topo do arquivo: a View chama o ViewModel aqui dentro
  // porque o page.tsx é Server Component e não pode invocar hooks.
  const { form, state, isPending, onValidSubmit } = useSignInViewModel();

  return (
    <Card className="mx-auto max-w-sm w-full bg-background text-text-primary border-input-border">
      <CardHeader>
        <CardTitle>Faça login para continuar</CardTitle>
        <CardDescription className="text-text-secondary">
          Insira seu email e senha para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/*
            onSubmit continua usando form.handleSubmit — ele roda o zod
            client-side e só chama `onValidSubmit` se passou. O
            `onValidSubmit` é que dispara a Server Action.
          */}
          <form onSubmit={form.handleSubmit(onValidSubmit)} noValidate>
            <div className="flex flex-col gap-6">
              {/*
                Erro vindo do servidor (ex.: "Email ou senha inválidos").
                `state.error` é undefined no primeiro render e vira string
                depois que a action executa.
              */}
              {state.error && (
                <p
                  role="alert"
                  className="text-sm text-error-val border border-error-val/40 rounded px-3 py-2"
                >
                  {state.error}
                </p>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        placeholder="m@exemplo.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        type="password"
                        placeholder="********"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full btn-gold font-display uppercase tracking-[0.12em] text-sm font-bold"
                >
                  {isPending ? "Entrando..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm font-bold">
              Não tem uma conta?{" "}
              <Link href="/signup" className="text-text-secondary">
                Criar conta
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
