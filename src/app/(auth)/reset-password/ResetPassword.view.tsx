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
import { useResetPasswordViewModel } from "./resetPassword.viewmodel";

interface ResetPasswordViewProps {
  token?: string;
}

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
  const { form, state, isPending, hasToken, onValidSubmit } =
    useResetPasswordViewModel(token);

  return (
    <Card className="mx-auto max-w-sm w-full bg-background text-text-primary border-input-border">
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription className="text-text-secondary">
          Escolha uma nova senha para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasToken ? (
          <div className="flex flex-col gap-4">
            <p
              role="alert"
              className="text-sm text-error-val border border-error-val/40 rounded px-3 py-2"
            >
              Link inválido. Solicite uma nova recuperação de senha.
            </p>
            <Link
              href="/forgot-password"
              className="text-sm text-text-secondary text-center underline"
            >
              Solicitar novo link
            </Link>
          </div>
        ) : state.success ? (
          <div className="flex flex-col gap-4">
            <p
              role="status"
              className="text-sm text-success border border-success/40 rounded px-3 py-2"
            >
              Senha redefinida com sucesso.
            </p>
            <Link
              href="/signin"
              className="text-sm text-text-secondary text-center underline"
            >
              Ir para o login
            </Link>
          </div>
        ) : (
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
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nova senha</FormLabel>
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

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full btn-gold font-display uppercase tracking-[0.12em] text-sm font-bold"
                >
                  {isPending ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
