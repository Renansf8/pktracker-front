"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground text-center p-8 font-sans">
        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          O servidor demorou para responder. Aguarde alguns segundos e tente
          novamente.
        </p>
        <div className="flex gap-2 mt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Início
          </Link>
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
