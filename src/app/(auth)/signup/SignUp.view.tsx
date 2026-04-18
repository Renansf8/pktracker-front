"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormMessage,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignUpViewModel } from "./signup.viewmodel";

export function SignUpView() {
  const { form, state, isPending, onValidSubmit } = useSignUpViewModel();

  return (
    <Card className="mx-auto max-w-sm w-full bg-background text-text-primary border-input-border">
      <CardHeader>
        <CardTitle>Crie sua conta</CardTitle>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        placeholder="Beleza"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input
                        className="border-input-border"
                        placeholder="Junior"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        autoComplete="new-password"
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
                  {isPending ? "Criando..." : "Criar"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm font-bold">
              Já tem uma conta?{" "}
              <Link href="/signin" className="text-text-secondary">
                Faça login
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
