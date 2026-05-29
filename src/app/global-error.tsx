"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isTooManyRequests =
    error.message.includes("429") ||
    error.message.includes("Too Many Requests");

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground text-center p-8 font-sans">
        <h1 className="text-2xl font-semibold">
          {isTooManyRequests ? "Muitas requisições" : "Algo deu errado"}
        </h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          {isTooManyRequests
            ? "O servidor está sobrecarregado no momento. Aguarde alguns segundos e tente novamente."
            : "Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial."}
        </p>
        <div className="flex gap-2 mt-2">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Início
          </a>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
