import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import {
  Form,
  FormField,
  FormMessage,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import type { SignInViewProps } from "./signin.types";

export function SignInView({ form, onSubmit }: SignInViewProps) {
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="mx-auto max-w-sm w-full bg-background text-text-primary border-input-border">
        <CardHeader>
          <CardTitle>Faça login para continuar</CardTitle>
          <CardDescription className="text-text-secondary">
            Insira seu email e senha para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full p-0 bg-black">
                    Login
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm font-bold">
                Não tem uma conta?{" "}
                <Link to="/signup" className="text-text-secondary">
                  Criar conta
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
