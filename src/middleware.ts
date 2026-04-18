/**
 * src/middleware.ts
 * ---------------------------------------------------------------------------
 * Middleware global do Next — roda no Edge runtime ANTES de cada request
 * bater em qualquer rota.
 *
 * Aqui substituímos os dois componentes antigos:
 *   - <ProtectedRoute> (bloqueava acesso a páginas sem token)
 *   - <PublicRoute>    (redirecionava usuário logado de volta pra home)
 *
 * Vantagem: tudo é resolvido no servidor, em uma única passagem, antes do
 * HTML ser gerado. O usuário não logado nunca baixa o JS das páginas
 * protegidas.
 *
 * O middleware tem duas responsabilidades:
 *   1. Se NÃO tem cookie de auth e a rota é protegida → redirecionar /signin.
 *   2. Se TEM cookie de auth e a rota é /signin ou /signup → mandar pra /.
 *
 * Não validamos o conteúdo do JWT aqui (isso exigiria um secret no Edge,
 * e o JWT que recebemos vem do backend — ele é quem tem o segredo). A
 * presença do cookie é uma heurística "boa o suficiente" — se o token
 * for inválido, a primeira chamada autenticada devolverá 401 e o client
 * vai deslogar o usuário.
 */
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth_token";

// Rotas que NÃO exigem login. Qualquer rota que começar com esses prefixos
// é considerada pública.
const PUBLIC_ROUTES = ["/signin", "/signup"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // 1. Usuário NÃO logado tentando acessar rota protegida → manda pro signin.
  if (!token && !isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    // Opcional: guardar a URL original para redirecionar após o login.
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Usuário JÁ logado tentando acessar /signin ou /signup → manda pra home.
  if (token && isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3. Caso contrário, segue o fluxo normal.
  return NextResponse.next();
}

/**
 * O `matcher` diz em quais paths o middleware deve rodar. Excluímos:
 *   - /api/*       → APIs têm proteção própria (ou são públicas por design)
 *   - /_next/*     → assets internos do Next (imagens otimizadas, scripts)
 *   - /favicon.ico → pode ser pedido antes do cookie estar setado
 *   - /monitoring  → tunnel route do Sentry (veja next.config.ts)
 *
 * Tudo o mais passa pela função `middleware` acima.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|monitoring).*)",
  ],
};
