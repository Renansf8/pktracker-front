"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  const isTooManyRequests =
    error.message.includes("429") || error.message.includes("Too Many Requests");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">
        {isTooManyRequests ? "Muitas requisições" : "Algo deu errado"}
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        {isTooManyRequests
          ? "O servidor está sobrecarregado no momento. Aguarde alguns segundos e tente novamente."
          : "Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial."}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push("/")}>
          Início
        </Button>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  );
}
