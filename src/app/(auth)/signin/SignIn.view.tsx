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
          <form onSubmit={form.handleSubmit(onValidSubmit)} noValidate>
            <div className="flex flex-col gap-6">
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
