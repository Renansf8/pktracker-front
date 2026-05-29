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

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        O servidor demorou para responder. Aguarde alguns segundos e tente
        novamente.
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
