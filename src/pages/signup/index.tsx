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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router";

const schema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  sobrenome: z.string().min(1, { message: "Sobrenome é obrigatório" }),
  email: z.string().email({ message: "Email é obrigatório" }),
  senha: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
});

type FormData = z.infer<typeof schema>;

export function SignUp() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
      senha: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="mx-auto max-w-sm w-full bg-background text-text-primary border-input-border">
        <CardHeader>
          <CardTitle>Crie sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="nome"
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
                  name="sobrenome"
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senha"
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
                Já tem uma conta?{" "}
                <Link to="/signin" className=" text-text-secondary">
                  Faça login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
