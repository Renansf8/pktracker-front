import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";

export function SignIn() {
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
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="border-input-border"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm text-text-secondary"
                  >
                    Esqueceu sua senha?
                  </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="border-input-border"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full p-0 bg-black">
                  Login
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm font-bold">
              Não tem uma conta?{" "}
              <Link to="/signup" className=" text-text-secondary">
                Criar conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
