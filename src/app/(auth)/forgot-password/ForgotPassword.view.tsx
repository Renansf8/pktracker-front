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
import { useForgotPasswordViewModel } from "./forgotPassword.viewmodel";

export function ForgotPasswordView() {
  const { form, state, isPending, onValidSubmit } =
    useForgotPasswordViewModel();

  return (
    <Card className="mx-auto max-w-sm w-full bg-background text-text-primary border-input-border">
      <CardHeader>
        <CardTitle>Esqueceu sua senha?</CardTitle>
        <CardDescription className="text-text-secondary">
          Informe seu email e enviaremos um link para redefinir sua senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success ? (
          <div className="flex flex-col gap-4">
            <p
              role="status"
              className="text-sm text-success border border-success/40 rounded px-3 py-2"
            >
              Se esse email estiver cadastrado, um link de recuperação foi
              enviado. Verifique sua caixa de entrada.
            </p>
            <Link
              href="/signin"
              className="text-sm text-text-secondary text-center underline"
            >
              Voltar para o login
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

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full btn-gold font-display uppercase tracking-[0.12em] text-sm font-bold"
                >
                  {isPending ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm font-bold">
                Lembrou a senha?{" "}
                <Link href="/signin" className="text-text-secondary">
                  Voltar para o login
                </Link>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
