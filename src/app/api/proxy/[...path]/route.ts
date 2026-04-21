/**
 * src/app/api/proxy/[...path]/route.ts
 * ---------------------------------------------------------------------------
 * Route Handler que repassa requisições do CLIENT para o backend real,
 * injetando o Authorization header a partir do cookie httpOnly.
 *
 * Cai aqui qualquer request que o axios do client fizer (porque seu
 * `baseURL` é "/api/proxy"). Ex:
 *
 *   apiClient.get("/tournaments?page=1")
 *   →  GET /api/proxy/tournaments?page=1
 *   →  Esse Route Handler entra em ação
 *   →  Lê cookie auth_token via cookies()
 *   →  Faz GET {API_BASE_URL}/tournaments?page=1 com Authorization header
 *   →  Retorna o que o backend devolveu
 *
 * Importante: este arquivo usa uma catch-all route `[...path]` (a sintaxe
 * dos colchetes + três pontos captura qualquer profundidade de path),
 * então UM arquivo só consegue cobrir TODOS os endpoints do backend.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const API_URL = process.env.API_BASE_URL;

type RouteContext = {
  // No Next 15, `params` virou Promise. Precisa ser aguardado antes de usar.
  params: Promise<{ path: string[] }>;
};

async function handler(req: NextRequest, ctx: RouteContext) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "API_BASE_URL não configurada no servidor" },
      { status: 500 },
    );
  }

  const { path } = await ctx.params;
  const token = await getSessionToken();

  // Reconstrói a URL original preservando query string.
  const targetUrl = `${API_URL}/${path.join("/")}${req.nextUrl.search}`;

  // Métodos sem body (GET, HEAD, DELETE) não devem mandar corpo — passar
  // body em GET quebra alguns servidores.
  const methodsWithoutBody = ["GET", "HEAD"];
  const hasBody = !methodsWithoutBody.includes(req.method);

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    // 60s alinhado ao timeout do axios client.
    signal: AbortSignal.timeout(60_000),
  };

  if (hasBody) {
    // Passa o body cru (Next não fez parse do JSON ainda) — evita
    // deserializar/reserializar sem motivo.
    init.body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (err) {
    console.error("[api/proxy] upstream error:", err);
    return NextResponse.json(
      { message: "Falha ao conectar com o backend" },
      { status: 502 },
    );
  }

  // Propagar a resposta o mais fielmente possível: status, corpo, e
  // content-type. Não copiamos todos os headers para evitar bagunça com
  // cookies/set-cookie do backend.
  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}

// Cada método HTTP precisa ser exportado nominalmente — esse é o contrato
// das Route Handlers do App Router. Como nosso handler já olha `req.method`,
// exportamos o mesmo para todos.
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
