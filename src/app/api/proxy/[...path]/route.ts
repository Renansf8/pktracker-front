import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const API_URL = process.env.API_BASE_URL;

type RouteContext = {
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

  const targetUrl = `${API_URL}/${path.join("/")}${req.nextUrl.search}`;

  const methodsWithoutBody = ["GET", "HEAD"];
  const hasBody = !methodsWithoutBody.includes(req.method);

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    signal: AbortSignal.timeout(60_000),
  };

  if (hasBody) {
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

  const contentType =
    upstream.headers.get("content-type") ?? "application/json";
  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
